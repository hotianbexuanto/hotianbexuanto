import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

// Icons (Material Symbols style paths)
const icons = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z',
  commit: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  pr: 'M7 3a2 2 0 0 0-2 2v9.17a3.001 3.001 0 1 0 2 0V5h4v2.17a3.001 3.001 0 1 0 2 0V5h2v9.17a3.001 3.001 0 1 0 2 0V5a2 2 0 0 0-2-2H7z',
  issue: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  repo: 'M3 2.75A2.75 2.75 0 015.75 0h14.5a.75.75 0 01.75.75v20.5a.75.75 0 01-.75.75h-6a.75.75 0 010-1.5h5.25v-4H6A1.5 1.5 0 004.5 18v.75c0 .716.43 1.334 1.05 1.605a.75.75 0 01-.6 1.374A3.25 3.25 0 013 18.75V2.75z',
  followers: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
};

function statRow(label, value, iconPath) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      },
      children: [
        {
          type: 'svg',
          props: {
            width: 14,
            height: 14,
            viewBox: '0 0 24 24',
            fill: colors.primary,
            children: {
              type: 'path',
              props: { d: iconPath },
            },
          },
        },
        {
          type: 'span',
          props: {
            style: { fontSize: '10px', color: colors.onSurfaceMuted, flex: 1 },
            children: label,
          },
        },
        {
          type: 'span',
          props: {
            style: { fontSize: '13px', fontWeight: 700, color: colors.onSurface },
            children: String(value),
          },
        },
      ],
    },
  };
}

/**
 * Render Stats Card - quarter width (194 x 260)
 */
export function renderStats(data, buildTime) {
  const children = [
    // Title
    {
      type: 'span',
      props: {
        style: { fontSize: '12px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '8px' },
        children: 'GitHub Stats',
      },
    },
    // Stats list
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        },
        children: [
          statRow('Stars', data.totalStars, icons.star),
          statRow('Commits', data.totalCommits, icons.commit),
          statRow('PRs', data.totalPRs, icons.pr),
          statRow('Issues', data.totalIssues, icons.issue),
          statRow('Repos', data.repos || 0, icons.repo),
          statRow('Followers', data.followers || 0, icons.followers),
        ],
      },
    },
  ];

  if (buildTime) {
    children.push({
      type: 'span',
      props: {
        style: { fontSize: '8px', color: colors.onSurfaceMuted, textAlign: 'right', marginTop: '4px' },
        children: `Updated: ${buildTime}`,
      },
    });
  }

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: `${cardWidth.quarter}px`,
        height: '260px',
        backgroundColor: colors.surfaceContainer,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: `${shape.cornerXl}px`,
        padding: `${spacing.md}px`,
        fontFamily,
        color: colors.onSurface,
      },
      children,
    },
  };
}
