import re
import json

# Läs filen
with open(r'c:\Users\chris\cvbrev\src\app\personligt-brev-exempel\[yrke]\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Hitta alla yrken och deras seoIntro
pattern = r"'([^']+)':\s*\{[^}]*yrke:\s*['\"]([^'\"]+)['\"][\s\S]*?seoIntro:\s*[`'\"]([^`'\"]+)[`'\"]"

matches = re.findall(pattern, content, re.MULTILINE)

results = []

for slug, yrke, seo_intro in matches:
    # Räkna ord
    words = len(seo_intro.split())

    # Räkna stycken (separerade med \n\n)
    paragraphs = len([p for p in seo_intro.split('\\n\\n') if p.strip()])

    # Kolla om det finns seoIntro
    has_intro = len(seo_intro) > 10

    # Identifiera problem
    problems = []
    if words < 150:
        problems.append(f"för kort ({words} ord)")
    if paragraphs < 3:
        problems.append(f"bara {paragraphs} stycken")
    if len(seo_intro) < 500:
        problems.append("för kort text")

    results.append({
        'slug': slug,
        'yrke': yrke,
        'words': words,
        'paragraphs': paragraphs,
        'problems': problems,
        'seoIntro': seo_intro[:200] + '...' if len(seo_intro) > 200 else seo_intro
    })

# Sortera efter antal ord
results.sort(key=lambda x: x['words'])

print("=" * 80)
print("ANALYS AV seoIntro FÖR ALLA PERSONLIGT BREV-EXEMPEL")
print("=" * 80)
print()

# Skriv ut alla med problem
print("YRKEN MED DÅLIG seoIntro (under 150 ord eller färre än 3 stycken):")
print("-" * 80)

count = 1
for r in results:
    if r['problems']:
        print(f"{count}. {r['slug']} - {r['yrke']} - {r['words']} ord - {r['paragraphs']} stycken")
        print(f"   Problem: {', '.join(r['problems'])}")
        print()
        count += 1

print("=" * 80)
print(f"SAMMANFATTNING:")
print(f"Totalt antal yrken: {len(results)}")
print(f"Yrken med problem: {len([r for r in results if r['problems']])}")
print(f"Yrken med bra seoIntro: {len([r for r in results if not r['problems']])}")
print("=" * 80)
