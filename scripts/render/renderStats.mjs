import { colors, shape, spacing, cardWidth } from './tokens.mjs';

// Icons (Material Symbols style paths)
const icons = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z',
  commit: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z',
  pr: 'M7 3a2 2 0 0 0-2 2v9.17a3.001 3.001 0 1 0 2 0V5h4v2.17a3.001 3.001 0 1 0 2 0V5h2v9.17a3.001 3.001 0 1 0 2 0V5a2 2 0 0 0-2-2H7z',
  issue: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  repo: 'M3 2.75A2.75 2.75 0 015.75 0h14.5a.75.75 0 01.75.75v20.5a.75.75 0 01-.75.75h-6a.75.75 0 010-1.5h5.25v-4H6A1.5 1.5 0 004.5 18v.75c0 .716.43 1.334 1.05 1.605a.75.75 0 01-.6 1.374A3.25 3.25 0 013 18.75V2.75z',
  fork: 'M5 3.25a.75.75 0 011.5 0v5.17a3.001 3.001 0 11-1.5 0V3.25zM5 16.75a.75.75 0 011.5 0v2a.75.75 0 01-1.5 0v-2zm7-13.5a.75.75 0 011.5 0v5.17a3.001 3.001 0 11-1.5 0V3.25z',
  followers: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
};

function svgIcon(path, color = colors.primary, size = 18) {
  return {
    type: 'svg',
    props: {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: color,
      children: {
        type: 'path',
        props: { d: path },
      },
    },
  };
}

function statItem(label, value, iconPath) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flex: '1 1 23%',
        minWidth: '140px',
        padding: '10px 12px',
        backgroundColor: colors.surfaceContainerHigh,
        borderRadius: `${shape.cornerMd}px`,
      },
      children: [
        svgIcon(iconPath, colors.primary, 18),
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '11px', color: colors.onSurfaceMuted, letterSpacing: '0.5px', textTransform: 'uppercase' },
                  children: label,
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 700, color: colors.onSurface },
                  children: String(value),
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * Render Stats Card - 390 x 260 (half width, vertical layout)
 * Shows: Stars, Commits, PRs, Issues, Repos, Followers, Contribs
 */
export function renderStats(data) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: `${cardWidth.half}px`,
        height: '260px',
        backgroundColor: colors.surfaceContainer,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: `${shape.cornerXl}px`,
        padding: `${spacing.lg}px`,
        fontFamily: 'Inter, sans-serif',
        color: colors.onSurface,
        gap: '6px',
      },
      children: [
        // Title
        {
          type: 'span',
          props: {
            style: { fontSize: '14px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '4px' },
            children: 'GitHub Statistics',
          },
        },
        // Row 1
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '6px', flex: 1 },
            children: [
              statItem('Stars', data.totalStars, icons.star),
              statItem('Commits', data.totalCommits, icons.commit),
            ],
          },
        },
        // Row 2
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '6px', flex: 1 },
            children: [
              statItem('PRs', data.totalPRs, icons.pr),
              statItem('Issues', data.totalIssues, icons.issue),
            ],
          },
        },
        // Row 3
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '6px', flex: 1 },
            children: [
              statItem('Repos', data.repos || 0, icons.repo),
              statItem('Followers', data.followers || 0, icons.followers),
            ],
          },
        },
      ],
    },
  };
}
