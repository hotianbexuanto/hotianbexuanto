import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { fetchUserStats, fetchLanguages, fetchContributions, fetchRecentActivity, fetchTimeDistribution } from './api/graphql.mjs';
import { renderStats } from './render/renderStats.mjs';
import { renderLanguages } from './render/renderLanguages.mjs';
import { renderStreak } from './render/renderStreak.mjs';
import { renderContributions } from './render/renderContributions.mjs';
import { renderActivity } from './render/renderActivity.mjs';
import { renderTimeDistribution } from './render/renderTimeDistribution.mjs';

const username = process.env.GH_USERNAME || 'hotianbexuanto';
const assetsDir = process.env.ASSETS_DIR || 'assets/generated';

// Load font (Satori requires TTF/OTF/woff, NOT woff2)
async function loadFont() {
  const regularPath = join('assets', 'fonts', 'MapleMono-NF-CN-Regular.ttf');
  const boldPath = join('assets', 'fonts', 'MapleMono-NF-CN-Bold.ttf');

  try {
    const fontData = await readFile(regularPath);
    const fontBoldData = await readFile(boldPath);
    return [
      { name: 'Maple Mono NF CN', data: fontData, weight: 400, style: 'normal' },
      { name: 'Maple Mono NF CN', data: fontBoldData, weight: 700, style: 'normal' },
    ];
  } catch {
    // Download Maple Mono NF CN
    console.log('Local fonts not found, downloading Maple Mono NF CN...');

    let regular, bold;

    // Strategy 1: Try fontsource CDN (woff format, Satori compatible)
    try {
      const regularUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/maple-mono-nf-cn@latest/chinese-simplified-400-normal.woff';
      const boldUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/maple-mono-nf-cn@latest/chinese-simplified-700-normal.woff';
      const [regularRes, boldRes] = await Promise.all([fetch(regularUrl), fetch(boldUrl)]);
      if (regularRes.ok && boldRes.ok) {
        regular = Buffer.from(await regularRes.arrayBuffer());
        bold = Buffer.from(await boldRes.arrayBuffer());
        console.log('Downloaded from fontsource CDN.');
      } else {
        throw new Error('fontsource CDN not available');
      }
    } catch {
      // Strategy 2: Download zip from GitHub releases and extract TTFs
      console.log('fontsource CDN failed, trying GitHub releases zip...');
      const { default: AdmZip } = await import('adm-zip');
      const zipUrl = 'https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMono-NF-CN.zip';
      const res = await fetch(zipUrl);
      if (!res.ok) {
        throw new Error(`Font zip download failed: ${res.status}`);
      }
      const zipBuffer = Buffer.from(await res.arrayBuffer());
      const zip = new AdmZip(zipBuffer);
      const entries = zip.getEntries();

      let regularEntry, boldEntry;
      for (const entry of entries) {
        const name = entry.entryName.toLowerCase();
        if (name.includes('regular') && name.endsWith('.ttf')) regularEntry = entry;
        if (name.includes('bold') && !name.includes('semi') && !name.includes('extra') && name.endsWith('.ttf')) boldEntry = entry;
      }

      if (!regularEntry || !boldEntry) {
        throw new Error('Could not find Regular/Bold TTF files in zip. Entries: ' + entries.map(e => e.entryName).join(', '));
      }

      regular = regularEntry.getData();
      bold = boldEntry.getData();
      console.log('Extracted from GitHub releases zip.');
    }

    await mkdir(join('assets', 'fonts'), { recursive: true });
    await writeFile(join('assets', 'fonts', 'MapleMono-NF-CN-Regular.ttf'), regular);
    await writeFile(join('assets', 'fonts', 'MapleMono-NF-CN-Bold.ttf'), bold);

    return [
      { name: 'Maple Mono NF CN', data: regular, weight: 400, style: 'normal' },
      { name: 'Maple Mono NF CN', data: bold, weight: 700, style: 'normal' },
    ];
  }
}

async function renderToSvg(element, fonts, width, height) {
  return satori(element, {
    width,
    height,
    fonts,
  });
}

async function main() {
  console.log(`Building profile assets for ${username}...`);

  // Load fonts
  const fonts = await loadFont();

  // Build timestamp (Beijing Time, UTC+8)
  const now = new Date();
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const buildTime = beijing.toISOString().replace('T', ' ').slice(0, 16) + ' CST';

  // Fetch data (with error handling)
  let stats, languages, contributions, activity, timeDistribution;
  try {
    console.log('Fetching GitHub data...');
    [stats, languages, contributions, activity, timeDistribution] = await Promise.all([
      fetchUserStats(username),
      fetchLanguages(username),
      fetchContributions(username),
      fetchRecentActivity(username),
      fetchTimeDistribution(username),
    ]);
    console.log('Data fetched successfully.');
  } catch (err) {
    console.error('Failed to fetch data:', err.message);
    console.log('Using fallback placeholder data.');
    stats = {
      name: username,
      bio: '',
      avatarUrl: '',
      login: username,
      followers: 0,
      repos: 0,
      totalStars: 0,
      totalCommits: 0,
      totalPRs: 0,
      totalIssues: 0,
      totalContributions: 0,
    };
    languages = [
      { name: 'Loading...', percent: 100, color: '#B186D6' },
    ];
    contributions = {
      currentStreak: 0,
      longestStreak: 0,
      totalContributions: 0,
      last30Days: new Array(30).fill(0),
      prev30Days: new Array(30).fill(0),
      last30Dates: new Array(30).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 29 + i);
        return d.toISOString().slice(0, 10);
      }),
    };
    activity = [];
    timeDistribution = new Array(24).fill(0);
  }

  stats.login = username;

  // Create output directory
  await mkdir(assetsDir, { recursive: true });

  // Render all cards
  // Row 1: 4 quarter-width cards (194 x 260)
  // Row 2: Time Distribution (390 x 260)
  // Row 3: Contribution Graph (800 x 220)
  const cards = [
    { name: 'stats.svg', element: renderStats(stats, buildTime), width: 194, height: 260 },
    { name: 'languages.svg', element: renderLanguages(languages, buildTime), width: 194, height: 260 },
    { name: 'streak.svg', element: renderStreak(contributions, buildTime), width: 194, height: 260 },
    { name: 'activity.svg', element: renderActivity(activity, buildTime), width: 194, height: 260 },
    { name: 'timedist.svg', element: renderTimeDistribution(timeDistribution, buildTime), width: 390, height: 260 },
    { name: 'contributions.svg', element: renderContributions(contributions, buildTime), width: 390, height: 260 },
  ];

  for (const card of cards) {
    try {
      const svg = await renderToSvg(card.element, fonts, card.width, card.height);
      await writeFile(join(assetsDir, card.name), svg);
      console.log(`  Generated ${card.name}`);
    } catch (err) {
      console.error(`  Failed to generate ${card.name}:`, err.message);
    }
  }

  console.log(`\nDone! ${cards.length} SVGs generated in ${assetsDir}/`);
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
