// Deploy script for match-jobs-v2 (Version 41: SSYK + 290 municipalities)
const fs = require('fs');
const path = require('path');

// Define the 6 files to deploy
const files = [
  'index.ts',
  'ai-enrichment.ts',
  'taxonomy-enhanced.ts',
  'scoring-engine-v2.ts',
  'multi-source-aggregator.ts',
  'cv-utils.ts'
];

// Read all files
const functionFiles = files.map(filename => {
  const filePath = path.join('supabase', 'functions', 'match-jobs-v2', filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return {
    name: filename,
    content: content
  };
});

// Create deployment payload
const deployment = {
  name: 'match-jobs-v2',
  files: functionFiles
};

// Write to stdout for piping
console.log(JSON.stringify(deployment));
