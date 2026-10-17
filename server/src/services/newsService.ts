import crypto from 'crypto';
import { prisma } from '../db.js';

export interface FeedConfig {
  source: string;
  category: string;
  url: string;
}

// Strict allowlist of verified reputable academic feeds (SSRF prevention)
export const ACADEMIC_FEEDS: FeedConfig[] = [
  // Science
  { source: 'Nature', category: 'Science', url: 'https://www.nature.com/nature.rss' },
  { source: 'Quanta Magazine', category: 'Science', url: 'https://api.quantamagazine.org/feed/' },
  { source: 'ScienceDaily', category: 'Science', url: 'https://www.sciencedaily.com/rss/all.xml' },
  { source: 'Phys.org', category: 'Science', url: 'https://phys.org/rss-feed/' },

  // Technology
  { source: 'MIT News', category: 'Technology', url: 'https://news.mit.edu/rss/topic/technology' },
  { source: 'Phys.org Tech', category: 'Technology', url: 'https://phys.org/rss-feed/technology-news/' },

  // Health & Medicine
  { source: 'Nature Medicine', category: 'Health & Medicine', url: 'https://www.nature.com/nm.rss' },
  { source: 'Medical Xpress', category: 'Health & Medicine', url: 'https://medicalxpress.com/rss-feed/' },

  // Education
  { source: 'Harvard Gazette', category: 'Education', url: 'https://news.harvard.edu/gazette/feed/' },
  { source: 'The Conversation Edu', category: 'Education', url: 'https://theconversation.com/us/topics/education-43/articles.atom' },

  // Humanities
  { source: 'Aeon Essays', category: 'Humanities', url: 'https://aeon.co/feed.rss' },

  // Arts
  { source: 'The Conversation Arts', category: 'Arts', url: 'https://theconversation.com/us/arts/articles.atom' },

  // Social Sciences
  { source: 'The Conversation Society', category: 'Social Sciences', url: 'https://theconversation.com/us/politics/articles.atom' },
];

let lastRefreshTime: number = 0;
let isRefreshing: boolean = false;

// HTML tag stripper and entity decoder
function stripHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(xmlSnippet: string): string | null {
  // Check enclosure
  const encMatch = xmlSnippet.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (encMatch && encMatch[1] && encMatch[1].startsWith('http')) return encMatch[1];

  // Check media:content
  const mediaMatch = xmlSnippet.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1] && mediaMatch[1].startsWith('http')) return mediaMatch[1];

  // Check <img> tag
  const imgMatch = xmlSnippet.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) return imgMatch[1];

  return null;
}

export function parseFeedXml(xml: string, feed: FeedConfig): Array<{
  title: string;
  excerpt: string;
  url: string;
  source: string;
  category: string;
  imageUrl: string | null;
  publishedAt: Date;
}> {
  const items: Array<any> = [];

  // Check if RSS or Atom
  const isAtom = xml.includes('<feed') && xml.includes('<entry');

  if (isAtom) {
    const entries = xml.split(/<entry[\s>]/i).slice(1);
    for (const entry of entries) {
      try {
        const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = stripHtml(titleMatch ? titleMatch[1] : '');
        if (!title) continue;

        let url = '';
        const linkMatch = entry.match(/<link[^>]+href=["']([^"']+)["']/i) || entry.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
        if (linkMatch) {
          url = stripHtml(linkMatch[1]);
        }
        if (!url || !url.startsWith('http')) continue;

        const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
          entry.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
        const rawExcerpt = summaryMatch ? summaryMatch[1] : '';
        const excerpt = stripHtml(rawExcerpt).slice(0, 260);

        const dateMatch = entry.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) ||
          entry.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
        const publishedAt = dateMatch ? new Date(stripHtml(dateMatch[1])) : new Date();

        const imageUrl = extractImage(entry);

        items.push({
          title,
          excerpt: excerpt || title,
          url,
          source: feed.source,
          category: feed.category,
          imageUrl,
          publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        });
      } catch (e) {
        // Skip malformed entry
      }
    }
  } else {
    // Standard RSS <item>
    const rssItems = xml.split(/<item[\s>]/i).slice(1);
    for (const itemXml of rssItems) {
      try {
        const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = stripHtml(titleMatch ? titleMatch[1] : '');
        if (!title) continue;

        const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
        let url = linkMatch ? stripHtml(linkMatch[1]) : '';
        if (!url || !url.startsWith('http')) {
          const guidMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
          if (guidMatch && guidMatch[1].startsWith('http')) {
            url = stripHtml(guidMatch[1]);
          }
        }
        if (!url || !url.startsWith('http')) continue;

        const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
          itemXml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
        const rawExcerpt = descMatch ? descMatch[1] : '';
        const excerpt = stripHtml(rawExcerpt).slice(0, 260);

        const dateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
          itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);
        const publishedAt = dateMatch ? new Date(stripHtml(dateMatch[1])) : new Date();

        const imageUrl = extractImage(itemXml);

        items.push({
          title,
          excerpt: excerpt || title,
          url,
          source: feed.source,
          category: feed.category,
          imageUrl,
          publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        });
      } catch (e) {
        // Skip malformed item
      }
    }
  }

  return items;
}

export async function fetchSingleFeed(feed: FeedConfig): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'EduFlowAcademicNewsBot/1.0 (Educational Academic News Feed Aggregator; contact@eduflow.app)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[NEWS] Feed ${feed.source} responded with status ${res.status}`);
      return [];
    }

    const xml = await res.text();
    // Cap response processing size (max 2MB)
    const safeXml = xml.slice(0, 2 * 1024 * 1024);
    return parseFeedXml(safeXml, feed);
  } catch (err: any) {
    console.warn(`[NEWS] Failed to fetch feed ${feed.source} (${feed.url}):`, err.message || err);
    return [];
  }
}

export async function refreshAllFeeds(force: boolean = false): Promise<number> {
  const now = Date.now();
  // Don't refresh if already running or if refreshed within the last 15 minutes unless forced
  if (isRefreshing) return 0;
  if (!force && now - lastRefreshTime < 15 * 60 * 1000) {
    return 0;
  }

  isRefreshing = true;
  console.info(`[NEWS] Refreshing academic news feeds from ${ACADEMIC_FEEDS.length} sources...`);

  let newItemsCount = 0;
  try {
    const promises = ACADEMIC_FEEDS.map((feed) => fetchSingleFeed(feed));
    const results = await Promise.all(promises);
    const flatItems = results.flat();

    console.info(`[NEWS] Fetched ${flatItems.length} total articles across all feeds. Upserting into Neon...`);

    const uniqueByUrl = new Map<string, any>();
    for (const item of flatItems) {
      if (!uniqueByUrl.has(item.url)) {
        uniqueByUrl.set(item.url, item);
      }
    }

    const itemsToInsert = Array.from(uniqueByUrl.values()).map((item) => ({
      id: crypto.randomUUID(),
      title: item.title,
      excerpt: item.excerpt,
      url: item.url,
      source: item.source,
      category: item.category,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
    }));

    // Batch insert in chunks of 50 for rapid network throughput
    for (let i = 0; i < itemsToInsert.length; i += 50) {
      const batch = itemsToInsert.slice(i, i + 50);
      try {
        const res = await prisma.newsItem.createMany({
          data: batch,
          skipDuplicates: true,
        });
        newItemsCount += res.count;
      } catch (batchErr) {
        console.warn('[NEWS] Batch insert error, continuing next chunk:', batchErr);
      }
    }

    lastRefreshTime = Date.now();
    console.info(`[NEWS] Successfully synced ${newItemsCount} academic news items.`);
  } catch (err: any) {
    console.error('[NEWS] Critical error during news feed refresh:', err);
  } finally {
    isRefreshing = false;
  }

  return newItemsCount;
}

export function getLastRefreshTime(): number {
  return lastRefreshTime;
}

// Background scheduler every 15 minutes
setInterval(() => {
  refreshAllFeeds().catch(() => {});
}, 15 * 60 * 1000);
