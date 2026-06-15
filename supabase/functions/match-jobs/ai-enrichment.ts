/**
 * AI-Powered Job Enrichment Service
 *
 * Använder Arbetsförmedlingens JobAd Enrichments API för att extrahera:
 * - Kompetenser (skills) med AI-precision
 * - SSYK-koder
 * - Erfarenhetskrav
 * - Utbildningsnivå
 * - Mjuka färdigheter
 *
 * API Docs: https://jobad-enrichments.api.jobtechdev.se
 */ const ENRICHMENTS_API = 'https://jobad-enrichments-api.jobtechdev.se';
const TAXONOMY_API = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';
export class AIEnrichmentService {
  supabase;
  ssykCache = new Map();
  constructor(supabase){
    this.supabase = supabase;
  }
  /**
   * Berika flera jobb samtidigt (batch processing)
   */ async enrichJobsBatch(jobs) {
    console.log(`[AI Enrichment] Processing ${jobs.length} jobs...`);
    const results = new Map();
    // Steg 1: Kolla cache först
    const jobIds = jobs.map((j)=>j.id);
    const cached = await this.getCachedEnrichments(jobIds);
    console.log(`[AI Enrichment] Cache hit: ${cached.size}/${jobs.length} jobs`);
    // Steg 2: Identifiera jobb som behöver berikas
    const uncachedJobs = jobs.filter((job)=>!cached.has(job.id));
    if (uncachedJobs.length === 0) {
      console.log('[AI Enrichment] All jobs found in cache!');
      return cached;
    }
    console.log(`[AI Enrichment] Need to enrich ${uncachedJobs.length} jobs`);
    // Steg 3: Berika i batches om 100 (API-limit)
    const BATCH_SIZE = 100;
    const newEnrichments = new Map();
    for(let i = 0; i < uncachedJobs.length; i += BATCH_SIZE){
      const batch = uncachedJobs.slice(i, i + BATCH_SIZE);
      console.log(`[AI Enrichment] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uncachedJobs.length / BATCH_SIZE)}`);
      try {
        // Försök med API först
        const batchEnrichments = await this.enrichBatchViaAPI(batch);
        // Om API failar, använd fallback
        if (batchEnrichments.size === 0) {
          console.warn('[AI Enrichment] API failed, using local fallback');
          const fallbackEnrichments = await this.enrichBatchLocally(batch);
          fallbackEnrichments.forEach((data, id)=>newEnrichments.set(id, data));
        } else {
          batchEnrichments.forEach((data, id)=>newEnrichments.set(id, data));
        }
      } catch (error) {
        console.error('[AI Enrichment] Batch error:', error);
        // Fallback till lokal enrichment
        const fallbackEnrichments = await this.enrichBatchLocally(batch);
        fallbackEnrichments.forEach((data, id)=>newEnrichments.set(id, data));
      }
      // Rate limiting mellan batches
      if (i + BATCH_SIZE < uncachedJobs.length) {
        await new Promise((resolve)=>setTimeout(resolve, 200));
      }
    }
    // Steg 4: Spara nya enrichments till cache
    if (newEnrichments.size > 0) {
      await this.saveEnrichmentsToCache(newEnrichments);
    }
    // Steg 5: Kombinera cached + nya
    const combined = new Map([
      ...cached,
      ...newEnrichments
    ]);
    console.log(`[AI Enrichment] ✅ Total enriched: ${combined.size} jobs`);
    return combined;
  }
  /**
   * Berika batch via JobAd Enrichments API
   */ async enrichBatchViaAPI(batch) {
    const results = new Map();
    try {
      // Korrekt format enligt API-dokumentation: https://jobad-enrichments-api.jobtechdev.se/
      const documents_input = batch.map((job)=>({
          doc_id: job.id,
          doc_headline: job.headline,
          doc_text: job.text
        }));
      // Använder /enrichtextdocuments istället för /binary för att få:
      // - ALLA terms med confidence scores (0.0-1.0)
      // - Mer flexibel filtrering (vi bestämmer threshold)
      // - Bättre för SSYK-lookup (även låg-confidence terms)
      const response = await fetch(`${ENRICHMENTS_API}/enrichtextdocuments`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documents_input
        })
      });
      if (!response.ok) {
        console.warn(`[AI Enrichment] API returned ${response.status}`);
        return results;
      }
      const data = await response.json();
      // API returnerar array av enriched documents direkt
      if (Array.isArray(data)) {
        for (const enrichedDoc of data){
          const jobId = enrichedDoc.doc_id;
          const enrichedData = await this.parseAPIResponse(jobId, enrichedDoc);
          results.set(jobId, enrichedData);
        }
      }
      console.log(`[AI Enrichment] API enriched ${results.size}/${batch.length} jobs (with SSYK codes from Taxonomy API)`);
    } catch (error) {
      console.error('[AI Enrichment] API error:', error);
    }
    return results;
  }
  /**
   * Slå upp SSYK-kod för ett yrke via Taxonomy API
   */ async lookupSSYKCode(occupationTerm) {
    // Kolla cache först
    if (this.ssykCache.has(occupationTerm.toLowerCase())) {
      return this.ssykCache.get(occupationTerm.toLowerCase()) || null;
    }
    try {
      const url = `${TAXONOMY_API}/specific/concepts/ssyk?preferred-label=${encodeURIComponent(occupationTerm)}&limit=1`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        console.warn(`[AI Enrichment] Taxonomy API error for "${occupationTerm}": ${response.status}`);
        this.ssykCache.set(occupationTerm.toLowerCase(), null);
        return null;
      }
      const data = await response.json();
      // API returnerar array med concepts
      if (Array.isArray(data) && data.length > 0) {
        const concept = data[0];
        const ssykCode = concept.ssyk_code_2012 || null;
        if (ssykCode) {
          console.log(`[AI Enrichment] ✅ Mapped "${occupationTerm}" → SSYK ${ssykCode}`);
          this.ssykCache.set(occupationTerm.toLowerCase(), ssykCode);
          return ssykCode;
        }
      }
      // Inget resultat
      console.warn(`[AI Enrichment] ⚠️ No SSYK code found for "${occupationTerm}"`);
      this.ssykCache.set(occupationTerm.toLowerCase(), null);
      return null;
    } catch (error) {
      console.error(`[AI Enrichment] Error looking up SSYK for "${occupationTerm}":`, error);
      this.ssykCache.set(occupationTerm.toLowerCase(), null);
      return null;
    }
  }
  /**
   * Parsa API-svar till vårt format
   * API-format från /enrichtextdocuments (UPPDATERAD - inte längre binary):
   * {
   *   doc_id: "...",
   *   doc_headline: "...",
   *   enriched_candidates: {
   *     occupations: [{ concept_label, term, term_misspelled, prediction, ... }],
   *     competencies: [{ concept_label, term, prediction, ... }],
   *     traits: [{ concept_label, term, prediction, ... }],
   *     geos: [{ concept_label, term, prediction, ... }]
   *   }
   * }
   *
   * VIKTIGT: prediction är 0.0-1.0 (AI confidence score)
   */ async parseAPIResponse(jobId, apiData) {
    const enrichedCandidates = apiData.enriched_candidates || {};
    // Occupations - slå upp SSYK-kod för varje yrke via Taxonomy API
    const occupationsList = enrichedCandidates.occupations || [];
    // OPTIMERING: Gör ALLA SSYK-lookups parallellt istället för sekventiellt
    const ssykPromises = occupationsList.map((occ)=>this.lookupSSYKCode(occ.term));
    const ssykCodes = await Promise.all(ssykPromises);
    const occupations = occupationsList.map((occ, index)=>({
        term: occ.term,
        weight: occ.prediction || 0.5,
        ssyk_code: ssykCodes[index] // Nu hämtar vi RÄTT SSYK-kod från Taxonomy API
      }));
    // Competencies (kompetenser/färdigheter)
    const competencies = (enrichedCandidates.competencies || []).map((comp)=>({
        term: comp.term,
        weight: comp.prediction || 0.5,
        category: comp.concept_label
      }));
    // Skills = både competencies och traits (mjuka färdigheter)
    const skills = [
      ...competencies.map((c)=>({
          term: c.term,
          weight: c.weight,
          type: 'hard'
        })),
      ...(enrichedCandidates.traits || []).map((trait)=>({
          term: trait.term,
          weight: trait.prediction || 0.5,
          type: 'soft'
        }))
    ];
    // Geos - platser (kan användas för geografisk matchning)
    const geos = (enrichedCandidates.geos || []).map((geo)=>({
        term: geo.term,
        weight: geo.prediction || 0.5 // Använd AI confidence
      }));
    return {
      jobId,
      occupations,
      skills,
      competencies,
      experience_required: undefined,
      education_level: undefined,
      languages: [] // API ger inte detta direkt
    };
  }
  /**
   * Fallback: Lokal text-baserad enrichment
   */ async enrichBatchLocally(batch) {
    const results = new Map();
    for (const job of batch){
      const enriched = await this.enrichJobLocally(job);
      results.set(job.id, enriched);
    }
    return results;
  }
  /**
   * Lokal enrichment (enkel keyword-matching)
   */ async enrichJobLocally(job) {
    const text = `${job.headline} ${job.text}`.toLowerCase();
    // Kompetenser genom keyword matching
    const commonSkills = [
      // Tech
      'javascript',
      'python',
      'java',
      'c#',
      'typescript',
      'react',
      'vue',
      'angular',
      'node.js',
      'sql',
      'git',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'devops',
      // Bygg/VVS
      'svetsning',
      'installation',
      'renovering',
      'nybyggnation',
      'service',
      'felsökning',
      'reparation',
      'underhåll',
      'projektering',
      'cad',
      'bim',
      // Verktyg
      'excel',
      'word',
      'powerpoint',
      'visma',
      'fortnox',
      'sap',
      'crm',
      'erp',
      // Ledarskap
      'projektledning',
      'teamledning',
      'personalansvar',
      'budgetansvar',
      // Allmänt
      'kundservice',
      'försäljning',
      'administration',
      'kommunikation'
    ];
    const skills = [];
    for (const skill of commonSkills){
      if (text.includes(skill)) {
        const occurrences = (text.match(new RegExp(skill, 'g')) || []).length;
        skills.push({
          term: skill,
          weight: Math.min(1.0, 0.5 + occurrences * 0.15)
        });
      }
    }
    // Erfarenhetskrav
    let experienceRequired = undefined;
    const expMatch = text.match(/(\d+)[+]?\s*(år|years)/i);
    if (expMatch) {
      experienceRequired = {
        years: parseInt(expMatch[1]),
        level: parseInt(expMatch[1]) >= 5 ? 'senior' : parseInt(expMatch[1]) >= 2 ? 'mid' : 'junior',
        weight: 0.75
      };
    }
    // Utbildningsnivå
    let educationLevel = undefined;
    if (text.includes('högskola') || text.includes('universitet') || text.includes('civilingenjör')) {
      educationLevel = {
        level: 'universitet',
        weight: 0.8
      };
    } else if (text.includes('gymnasie')) {
      educationLevel = {
        level: 'gymnasial',
        weight: 0.8
      };
    }
    return {
      jobId: job.id,
      skills,
      experience_required: experienceRequired,
      education_level: educationLevel
    };
  }
  /**
   * Hämta cachade enrichments från databas
   */ async getCachedEnrichments(jobIds) {
    const results = new Map();
    try {
      const { data } = await this.supabase.from('enriched_jobs').select('*').in('job_id', jobIds).gt('expires_at', new Date().toISOString());
      if (data) {
        data.forEach((row)=>{
          results.set(row.job_id, {
            jobId: row.job_id,
            occupations: row.occupations,
            skills: row.skills,
            competencies: row.competencies,
            experience_required: row.experience_required,
            education_level: row.education_level,
            languages: row.languages
          });
        });
      }
    } catch (error) {
      console.error('[AI Enrichment] Cache read error:', error);
    }
    return results;
  }
  /**
   * Spara enrichments till databas-cache
   */ async saveEnrichmentsToCache(enrichments) {
    try {
      const cacheData = Array.from(enrichments.entries()).map(([jobId, data])=>({
          job_id: jobId,
          job_headline: null,
          occupations: data.occupations || null,
          skills: data.skills || null,
          competencies: data.competencies || null,
          experience_required: data.experience_required || null,
          education_level: data.education_level || null,
          languages: data.languages || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        }));
      if (cacheData.length > 0) {
        await this.supabase.from('enriched_jobs').upsert(cacheData, {
          onConflict: 'job_id'
        });
        console.log(`[AI Enrichment] Saved ${cacheData.length} enrichments to cache`);
      }
    } catch (error) {
      console.error('[AI Enrichment] Cache save error:', error);
    }
  }
}
