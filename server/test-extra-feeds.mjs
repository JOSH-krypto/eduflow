const candidates = [
  { source: 'Phys.org Social Sciences', category: 'Social Sciences', url: 'https://phys.org/rss-feed/social-sciences-news/' },
  { source: 'The Conversation Politics/Society', category: 'Social Sciences', url: 'https://theconversation.com/us/politics/articles.atom' },
  { source: 'Harvard Gazette', category: 'Education', url: 'https://news.harvard.edu/gazette/feed/' },
  { source: 'Quanta Magazine', category: 'Science', url: 'https://api.quantamagazine.org/feed/' },
];

async function run() {
  for (const f of candidates) {
    try {
      const res = await fetch(f.url, {
        headers: { 'User-Agent': 'EduFlowAcademicNewsBot/1.0 (Educational Academic Aggregator)' },
      });
      const text = await res.text();
      console.log(`${f.ok ? '✅' : (res.ok ? '✅' : '❌')} ${f.source} [${f.category}]: HTTP ${res.status} (${(text.length / 1024).toFixed(1)} KB, hasItems=${text.includes('<item') || text.includes('<entry')})`);
    } catch (e) {
      console.log(`❌ ${f.source}: ${e.message}`);
    }
  }
}

run();
