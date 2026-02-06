import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Stats Card - quarter width (194 x 260)
 * Multi-line chart showing weekly Commits, PRs, Issues
 * Plus compact summary for Stars, Repos, Followers
 */
export function renderStats(data, weeklyStats, buildTime) {
  const { commits, prs, issues, labels } = weeklyStats;
  const numPoints = commits.length;

  // Chart dimensions
  const chartW = 158;
  const chartH = 90;
  const padTop = 4;

  // Series definitions
  const series = [
    { data: commits, color: colors.primary, label: 'Commits' },
    { data: prs, color: colors.success, label: 'PRs' },
    { data: issues, color: colors.warning, label: 'Issues' },
  ];

  // Y-axis scale
  const allValues = [...commits, ...prs, ...issues];
  const maxVal = Math.max(...allValues, 1);

  // Convert data points to chart coordinates
  function toCoords(values) {
    return values.map((v, i) => ({
      x: (i / (numPoints - 1)) * chartW,
      y: padTop + (chartH - padTop) - (v / maxVal) * (chartH - padTop),
    }));
  }

  // Build SVG children
  const svgChildren = [];

  // Horizontal grid lines (4 lines)
  for (let i = 0; i <= 4; i++) {
    const y = padTop + ((chartH - padTop) / 4) * i;
    svgChildren.push({
      type: 'line',
      props: { x1: 0, y1: y, x2: chartW, y2: y, stroke: colors.surfaceBorder, strokeWidth: 0.5 },
    });
  }

  // Draw each series (area fill + line + end dot)
  for (const s of series) {
    const coords = toCoords(s.data);
    const pointsStr = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    // Semi-transparent area fill
    const areaD = `M${coords[0].x},${chartH} `
      + coords.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      + ` L${coords[coords.length - 1].x},${chartH} Z`;
    svgChildren.push({
      type: 'path',
      props: { d: areaD, fill: s.color, opacity: 0.1 },
    });

    // Line
    svgChildren.push({
      type: 'polyline',
      props: {
        points: pointsStr,
        fill: 'none',
        stroke: s.color,
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    });

    // End point dot
    const last = coords[coords.length - 1];
    svgChildren.push({
      type: 'circle',
      props: { cx: last.x, cy: last.y, r: 2.5, fill: s.color },
    });
  }

  // Legend item
  function legendItem(label, color, total) {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: '3px' },
        children: [
          {
            type: 'div',
            props: {
              style: {
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: color, flexShrink: 0,
              },
              children: '',
            },
          },
          {
            type: 'span',
            props: {
              style: { fontSize: '9px', color: colors.onSurfaceMuted },
              children: `${label} ${total}`,
            },
          },
        ],
      },
    };
  }

  // Compact summary row
  function summaryRow(label, value) {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: '4px' },
        children: [
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
              style: { fontSize: '12px', fontWeight: 700, color: colors.onSurface },
              children: String(value),
            },
          },
        ],
      },
    };
  }

  const children = [
    // Title
    {
      type: 'span',
      props: {
        style: { fontSize: '12px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '4px' },
        children: 'GitHub Stats',
      },
    },
    // Line chart
    {
      type: 'svg',
      props: {
        width: chartW,
        height: chartH,
        viewBox: `0 0 ${chartW} ${chartH}`,
        children: svgChildren,
      },
    },
    // Legend row
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          marginBottom: '6px',
        },
        children: series.map(s =>
          legendItem(s.label, s.color, s.data.reduce((a, b) => a + b, 0))
        ),
      },
    },
    // Divider
    {
      type: 'div',
      props: {
        style: { width: '100%', height: '1px', backgroundColor: colors.surfaceBorder, marginBottom: '6px' },
        children: '',
      },
    },
    // Summary stats
    {
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', gap: '3px' },
        children: [
          summaryRow('Stars', data.totalStars),
          summaryRow('Repos', data.repos || 0),
          summaryRow('Followers', data.followers || 0),
        ],
      },
    },
  ];

  if (buildTime) {
    children.push({
      type: 'span',
      props: {
        style: { fontSize: '8px', color: colors.onSurfaceMuted, textAlign: 'right', marginTop: 'auto' },
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
