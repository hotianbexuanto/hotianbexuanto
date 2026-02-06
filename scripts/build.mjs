import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { fetchUserStats, fetchLanguages, fetchContributions, fetchRecentActivity } from './api/graphql.mjs';
import { renderStats } from './render/renderStats.mjs';
import { renderLanguages } from './render/renderLanguages.mjs';
import { renderStreak } from './render/renderStreak.mjs';
import { renderContributions } from './render/renderContributions.mjs';
import { renderActivity } from './render/renderActivity.mjs';

const username = process.env.GH_USERNAME || 'hotianbexuanto';
const assetsDir = process.env.ASSETS_DIR || 'assets/generated';

// Load font (Satori requires TTF/OTF/woff, NOT woff2)
async function loadFont() {
  const regularPath = join('assets', 'fonts', 'Inter-Regular.otf');
  const boldPath = join('assets', 'fonts', 'Inter-Bold.otf');

  try {
    const fontData = await readFile(regularPath);
    const fontBoldData = await readFile(boldPath);
    return [
      { name: 'Inter', data: fontData, weight: 400, style: 'normal' },
      { name: 'Inter', data: fontBoldData, weight: 700, style: 'normal' },
    ];
  } catch {
    // Download from Google Fonts CSS2 API (requesting woff format via user-agent trick)
    console.log('Local fonts not found, downloading Inter...');

    // Use fontsource CDN which provides direct woff files
    const regularUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff';
    const boldUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff';

    const regularRes = await fetch(regularUrl);
    const boldRes = await fetch(boldUrl);

    if (!regularRes.ok || !boldRes.ok) {
      throw new Error(`Font download failed: regular=${regularRes.status} bold=${boldRes.status}`);
    }

    const regular = Buffer.from(await regularRes.arrayBuffer());
    const bold = Buffer.from(await boldRes.arrayBuffer());

    await mkdir(join('assets', 'fonts'), { recursive: true });
    await writeFile(join('assets', 'fonts', 'Inter-Regular.woff'), regular);
    await writeFile(join('assets', 'fonts', 'Inter-Bold.woff'), bold);

    return [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
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

  // Fetch data (with error handling)
  let stats, languages, contributions, activity;
  try {
    console.log('Fetching GitHub data...');
    [stats, languages, contributions, activity] = await Promise.all([
      fetchUserStats(username),
      fetchLanguages(username),
      fetchContributions(username),
      fetchRecentActivity(username),
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
    };
    activity = [];
  }

  stats.login = username;

  // Create output directory
  await mkdir(assetsDir, { recursive: true });

  // Render all cards (paired layout)
  const cards = [
    { name: 'stats.svg', element: renderStats(stats), width: 390, height: 260 },
    { name: 'languages.svg', element: renderLanguages(languages), width: 390, height: 260 },
    { name: 'streak.svg', element: renderStreak(contributions), width: 390, height: 260 },
    { name: 'activity.svg', element: renderActivity(activity), width: 390, height: 260 },
    { name: 'contributions.svg', element: renderContributions(contributions), width: 800, height: 220 },
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
