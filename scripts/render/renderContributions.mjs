import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Contribution Graph Card - 390 x 260 (half width)
 * Compact Bezier area chart with Y-axis, X-axis labels, and stats
 */
export function renderContributions(data, buildTime) {
  const points = data.last30Days;
  const dates = data.last30Dates || [];
  const maxVal = Math.max(...points, 1);
  const minVal = Math.min(...points);
  const avgVal = Math.round(points.reduce((s, v) => s + v, 0) / points.length);
  const totalContributions = points.reduce((s, v) => s + v, 0);

  const peakIdx = Math.max(0, points.indexOf(Math.max(...points)));

  const chartW = 310;
  const chartH = 100;

  const coords = points.map((v, i) => ({
    x: (i / (points.length - 1)) * chartW,
    y: chartH - (v / maxVal) * chartH,
  }));

  const peakCoord = coords[peakIdx];

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
    ` L ${coords[coords.length - 1].x} ${chartH}` +
    ` L 0 ${chartH} Z`;

  // Y-axis values
  const yLabels = [maxVal, Math.round(maxVal / 2), 0];

  // X-axis dates (4 labels)
  const dateIndices = [0, 10, 20, 29].filter(i => i < dates.length);
  const dateLabels = dateIndices.map(i => {
    const d = dates[i];
    if (!d) return '';
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  });

  const svgChildren = [
    // Grid lines
    ...[0, 0.5, 1].map(frac => ({
      type: 'line',
      props: {
        x1: 0,
        y1: chartH * (1 - frac),
        x2: chartW,
        y2: chartH * (1 - frac),
        stroke: colors.surfaceContainerHigh,
        strokeWidth: 1,
        strokeDasharray: '3,3',
      },
    })),
    // Area
    {
      type: 'path',
      props: { d: areaPath, fill: colors.primaryContainer },
    },
    // Line
    {
      type: 'path',
      props: {
        d: linePath,
        fill: 'none',
        stroke: colors.primary,
        strokeWidth: 2,
        strokeLinecap: 'round',
      },
    },
    // Dots every 10th point
    ...coords.filter((_, i) => i % 10 === 0 && i !== peakIdx).map(c => ({
      type: 'circle',
      props: {
        cx: c.x, cy: c.y, r: 2.5,
        fill: colors.surfaceContainer,
        stroke: colors.primary,
        strokeWidth: 1.5,
      },
    })),
    // Peak dot
    {
      type: 'circle',
      props: {
        cx: peakCoord.x, cy: peakCoord.y, r: 4,
        fill: colors.primary,
        stroke: colors.surfaceContainer,
        strokeWidth: 2,
      },
    },
    // Peak vertical line
    {
      type: 'line',
      props: {
        x1: peakCoord.x, y1: peakCoord.y + 6,
        x2: peakCoord.x, y2: chartH,
        stroke: colors.primary,
        strokeWidth: 1,
        strokeDasharray: '2,2',
        opacity: 0.4,
      },
    },
  ];

  function statPill(label, value, color) {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: '3px' },
        children: [
          { type: 'span', props: { style: { fontSize: '9px', color: colors.onSurfaceMuted }, children: label } },
          { type: 'span', props: { style: { fontSize: '11px', fontWeight: 700, color }, children: String(value) } },
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
        children: '贡献活动 (30天)',
      },
    },
    // Stats row
    {
      type: 'div',
      props: {
        style: { display: 'flex', gap: '10px', marginBottom: '6px' },
        children: [
          statPill('总计', totalContributions, colors.primary),
          statPill('日均', avgVal, colors.onSurface),
          statPill('峰值', maxVal, colors.success),
          statPill('最低', minVal, colors.warning),
        ],
      },
    },
    // Chart area: Y-axis + SVG
    {
      type: 'div',
      props: {
        style: { display: 'flex', flex: 1 },
        children: [
          // Y-axis labels
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '24px',
                height: `${chartH}px`,
                flexShrink: 0,
                paddingRight: '3px',
              },
              children: yLabels.map(v => ({
                type: 'span',
                props: {
                  style: { fontSize: '8px', color: colors.onSurfaceMuted, textAlign: 'right', lineHeight: '1' },
                  children: String(v),
                },
              })),
            },
          },
          // SVG
          {
            type: 'svg',
            props: {
              width: chartW,
              height: chartH,
              viewBox: `0 0 ${chartW} ${chartH}`,
              children: svgChildren,
            },
          },
        ],
      },
    },
    // X-axis date labels
    {
      type: 'div',
      props: {
        style: { display: 'flex', justifyContent: 'space-between', paddingLeft: '24px', marginTop: '3px' },
        children: dateLabels.map(label => ({
          type: 'span',
          props: {
            style: { fontSize: '8px', color: colors.onSurfaceMuted },
            children: label,
          },
        })),
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
        width: `${cardWidth.half}px`,
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
