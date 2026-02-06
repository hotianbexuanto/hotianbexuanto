import { colors, shape, spacing, cardWidth } from './tokens.mjs';

/**
 * Render Contribution Graph Card - 800 x 220 (light fresh style)
 * Smooth Bezier area chart with subtle grid
 */
export function renderContributions(data) {
  const points = data.last30Days;
  const maxVal = Math.max(...points, 1);
  const chartW = 700;
  const chartH = 120;
  const padLeft = 50;
  const padTop = 50;

  const coords = points.map((v, i) => ({
    x: padLeft + (i / (points.length - 1)) * chartW,
    y: padTop + chartH - (v / maxVal) * chartH,
  }));

  // Smooth Bezier curve
  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 3;
    const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
    linePath += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaPath = linePath +
    ` L ${coords[coords.length - 1].x} ${padTop + chartH}` +
    ` L ${padLeft} ${padTop + chartH} Z`;

  const totalContributions = points.reduce((s, v) => s + v, 0);

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: `${cardWidth.full}px`,
        height: '220px',
        backgroundColor: colors.surfaceContainer,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: `${shape.cornerXl}px`,
        padding: `${spacing.lg}px`,
        fontFamily: 'Inter, sans-serif',
        color: colors.onSurface,
      },
      children: [
        // Header
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '14px', fontWeight: 600, color: colors.onSurfaceVariant },
                  children: 'Contribution Activity (30 Days)',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    backgroundColor: colors.primaryContainer,
                    color: colors.primary,
                    borderRadius: `${shape.cornerFull}px`,
                    padding: '3px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                  },
                  children: `${totalContributions} contributions`,
                },
              },
            ],
          },
        },
        // Chart SVG
        {
          type: 'svg',
          props: {
            width: cardWidth.full - spacing.lg * 2,
            height: chartH + 20,
            viewBox: `0 0 ${cardWidth.full - spacing.lg * 2} ${chartH + padTop - 20}`,
            children: [
              // Subtle grid lines
              ...[0, 0.5, 1].map(frac => ({
                type: 'line',
                props: {
                  x1: padLeft,
                  y1: padTop + chartH * (1 - frac),
                  x2: padLeft + chartW,
                  y2: padTop + chartH * (1 - frac),
                  stroke: colors.surfaceContainerHigh,
                  strokeWidth: 1,
                  strokeDasharray: '4,4',
                },
              })),
              // Area fill with gradient effect (light purple)
              {
                type: 'path',
                props: {
                  d: areaPath,
                  fill: colors.primaryContainer,
                },
              },
              // Line
              {
                type: 'path',
                props: {
                  d: linePath,
                  fill: 'none',
                  stroke: colors.primary,
                  strokeWidth: 2.5,
                  strokeLinecap: 'round',
                },
              },
              // Dots at every 5th data point
              ...coords.filter((_, i) => i % 5 === 0).map(c => ({
                type: 'circle',
                props: {
                  cx: c.x,
                  cy: c.y,
                  r: 3,
                  fill: colors.surfaceContainer,
                  stroke: colors.primary,
                  strokeWidth: 2,
                },
              })),
            ],
          },
        },
      ],
    },
  };
}
