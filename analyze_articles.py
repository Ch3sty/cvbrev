import os
import re
from collections import defaultdict

# Path to articles
ARTICLES_PATH = r"C:\Users\chris\cvbrev\content\artiklar"

# Data structures
articles = []
categories = defaultdict(list)
all_tags = defaultdict(int)
all_keywords = []

# Read all MDX files
for filename in os.listdir(ARTICLES_PATH):
    if filename.endswith('.mdx'):
        filepath = os.path.join(ARTICLES_PATH, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

            # Extract metadata
            title_match = re.search(r'^title:\s*["\'](.+?)["\']', content, re.MULTILINE)
            tags_match = re.search(r'^tags:\s*\[(.+?)\]', content, re.MULTILINE | re.DOTALL)
            desc_match = re.search(r'^description:\s*["\'](.+?)["\']', content, re.MULTILINE)

            article_data = {
                'filename': filename,
                'slug': filename.replace('.mdx', ''),
                'title': title_match.group(1) if title_match else 'No title',
                'tags': [],
                'description': desc_match.group(1) if desc_match else ''
            }

            # Extract tags
            if tags_match:
                tags_str = tags_match.group(1)
                tags = re.findall(r'["\']([^"\']+)["\']', tags_str)
                article_data['tags'] = tags
                for tag in tags:
                    all_tags[tag] += 1

            articles.append(article_data)

# Categorize articles based on filename patterns
cv_articles = []
personligt_brev_articles = []
intervju_articles = []
karriar_articles = []
ai_articles = []
other_articles = []

for article in articles:
    slug = article['slug']
    if 'cv-' in slug or slug.startswith('cv'):
        cv_articles.append(article)
    elif 'personligt-brev' in slug:
        personligt_brev_articles.append(article)
    elif 'intervju' in slug:
        intervju_articles.append(article)
    elif 'karriar' in slug or 'byta-jobb' in slug:
        karriar_articles.append(article)
    elif 'ai-' in slug:
        ai_articles.append(article)
    else:
        other_articles.append(article)

# Print analysis
print("=" * 80)
print("INNEHÅLLSINVENTERING - JOBBCOACH.AI")
print("=" * 80)
print(f"\nTOTALT ANTAL ARTIKLAR: {len(articles)}")
print("\n" + "=" * 80)

print("\n\n### INNEHÅLLSKATEGORIER\n")
print(f"CV-relaterade artiklar: {len(cv_articles)}")
print(f"Personligt brev-artiklar: {len(personligt_brev_articles)}")
print(f"Intervju-artiklar: {len(intervju_articles)}")
print(f"Karriär/Jobbyte-artiklar: {len(karriar_articles)}")
print(f"AI-rekrytering-artiklar: {len(ai_articles)}")
print(f"Övriga artiklar: {len(other_articles)}")

print("\n\n### CV-ARTIKLAR ({})".format(len(cv_articles)))
for article in sorted(cv_articles, key=lambda x: x['slug']):
    print(f"  - {article['slug']}")

print("\n\n### PERSONLIGT BREV-ARTIKLAR ({})".format(len(personligt_brev_articles)))
for article in sorted(personligt_brev_articles, key=lambda x: x['slug']):
    print(f"  - {article['slug']}")

print("\n\n### INTERVJU-ARTIKLAR ({})".format(len(intervju_articles)))
for article in sorted(intervju_articles, key=lambda x: x['slug']):
    print(f"  - {article['slug']}")

print("\n\n### KARRIÄR/JOBBYTE-ARTIKLAR ({})".format(len(karriar_articles)))
for article in sorted(karriar_articles, key=lambda x: x['slug']):
    print(f"  - {article['slug']}")

print("\n\n### AI-REKRYTERING-ARTIKLAR ({})".format(len(ai_articles)))
for article in sorted(ai_articles, key=lambda x: x['slug']):
    print(f"  - {article['slug']}")

print("\n\n### ÖVRIGA ARTIKLAR ({})".format(len(other_articles)))
for article in sorted(other_articles, key=lambda x: x['slug']):
    print(f"  - {article['slug']}")

print("\n\n### TOP 30 MEST ANVÄNDA TAGS")
for tag, count in sorted(all_tags.items(), key=lambda x: x[1], reverse=True)[:30]:
    print(f"  {count:3d}x  {tag}")

print("\n\n### PERSONLIGT BREV - YRKESSPECIFIKA ARTIKLAR")
yrken = []
for article in personligt_brev_articles:
    slug = article['slug']
    if slug.startswith('personligt-brev-') and slug not in [
        'personligt-brev-exempel-generella',
        'personligt-brev-exempel-roller',
        'personligt-brev-exempel-situationer',
        'personligt-brev-exempel-unga',
        'personligt-brev-guide',
        'personligt-brev-struktur-innehall',
        'personligt-brev-kompetenser-egenskaper',
        'personligt-brev-mall-gratis',
        'personligt-brev-pa-engelska',
        'personligt-brev-layout',
        'personligt-brev-spontanansokan',
        'personligt-brev-utan-erfarenhet',
        'personligt-brev-utbildning',
        'personligt-brev-sommarjobb'
    ]:
        yrke = slug.replace('personligt-brev-', '')
        yrken.append(yrke)

print(f"\nAntal yrkesspecifika personliga brev: {len(yrken)}")
for yrke in sorted(yrken):
    print(f"  - {yrke}")

print("\n\n" + "=" * 80)
print("ANALYS SLUTFÖRD")
print("=" * 80)
