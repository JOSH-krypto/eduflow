const candidateFeeds = [
  // Science
  { source: 'Phys.org', category: 'Science', url: 'https://phys.org/rss-feed/' },
  { source: 'Nature', category: 'Science', url: 'https://www.nature.com/nature.rss' },
  { source: 'ScienceDaily', category: 'Science', url: 'https://www.sciencedaily.com/rss/all.xml' },

  // Technology
  { source: 'MIT News', category: 'Technology', url: 'https://news.mit.edu/rss/topic/technology' },
  { source: 'Phys.org Tech', category: 'Technology', url: 'https://phys.org/rss-feed/technology-news/' },

  // Health & Medicine
  { source: 'Medical Xpress', category: 'Health & Medicine', url: 'https://medicalxpress.com/rss-feed/' },
  { source: 'Nature Medicine', category: 'Health & Medicine', url: 'https://www.nature.com/nm.rss' },

  // Education
  { source: 'Inside Higher Ed', category: 'Education', url: 'https://www.insidehighered.com/feed' },
  { source: 'The Conversation Edu', category: 'Education', url: 'https://theconversation.com/us/topics/education-43/articles.atom' },

  // Humanities & Arts
  { source: 'Smithsonian History', category: 'Humanities', url: 'https://www.smithsonianmag.com/rss/history-archaeology/' },
  { source: 'The Conversation Arts', category: 'Arts', url: 'https://theconversation.com/us/arts/articles.atom' },
  { source: 'Aeon', category: 'Humanities', url: 'https://aeon.co/feed.rss' },
];

async function testFeeds() {
  console.log('Testing candidate academic RSS feeds...\n');
  const results = [];

  for (const feed of candidateFeeds) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'EduFlowAcademicNewsBot/1.0 (Educational Academic Aggregator; contact@eduflow.app)',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.log(`❌ ${feed.source} [${feed.category}]: HTTP ${res.status}`);
        results.push({ ...feed, ok: false, error: `HTTP ${res.status}` });
        continue;
      }

      const text = await res.text();
      const hasItem = text.includes('<item') || text.includes('<entry');
      console.log(`✅ ${feed.source} [${feed.category}]: OK (${(text.length / 1024).toFixed(1)} KB, hasItems=${hasItem})`);
      results.push({ ...feed, ok: true, length: text.length });
    } catch (err) {
      console.log(`❌ ${feed.source} [${feed.category}]: ${err.message}`);
      results.push({ ...feed, ok: false, error: err.message });
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Active feeds: ${results.filter(r => r.ok).length}/${results.length}`);
}

testFeeds();
