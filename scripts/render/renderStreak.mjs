import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Contribution Overview Card - quarter width (194 x 260)
 * Line chart of last 30 days with grid, max/min markers, and streak metrics
 */
export function renderStreak(data, buildTime) {
  const last30 = data.last30Days || new Array(30).fill(0);
  const points = last30;
  const numPoints = points.length;

  // Chart dimensions
  const chartW = 158;
  const chartH = 95;
  const padTop = 6;
  const effectiveH = chartH - padTop;

  // Scale
  const rawMax = Math.max(...points);
  const maxVal = Math.max(rawMax, 1);
  const minVal = Math.min(...points);

  // Find peak / trough indices
  const peakIdx = points.indexOf(rawMax);
  const troughIdx = points.indexOf(minVal);

  // Convert to chart coordinates
  const coords = points.map((v, i) => ({
    x: (i / (numPoints - 1)) * chartW,
    y: padTop + effectiveH - (v / maxVal) * effectiveH,
  }));

  // Build SVG children
  const svgChildren = [];

  // Horizontal grid lines (4)
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (effectiveH / 4) * i;
    svgChildren.push({
      type: 'line',
      props: { x1: 0, y1: y, x2: chartW, y2: y, stroke: colors.surfaceBorder, strokeWidth: 0.5 },
    });
  }

  // Area fill
  const pointsStr = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `M${coords[0].x},${chartH} `
    + coords.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    + ` L${coords[coords.length - 1].x},${chartH} Z`;
  svgChildren.push({ type: 'path', props: { d: areaD, fill: colors.primary, opacity: 0.12 } });

  // Line
  svgChildren.push({
    type: 'polyline',
    props: {
      points: pointsStr,
      fill: 'none',
      stroke: colors.primary,
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
  });

  // Peak marker (triangle up + vertical dashed)
  if (rawMax > 0) {
    const pk = coords[peakIdx];
    // Vertical dashed line
    svgChildren.push({
      type: 'line',
      props: { x1: pk.x, y1: pk.y, x2: pk.x, y2: chartH, stroke: colors.success, strokeWidth: 0.7, strokeDasharray: '2,2' },
    });
    // Dot
    svgChildren.push({ type: 'circle', props: { cx: pk.x, cy: pk.y, r: 3, fill: colors.success } });
  }

  // Trough marker (only if different from peak)
  if (troughIdx !== peakIdx) {
    const tr = coords[troughIdx];
    svgChildren.push({
      type: 'line',
      props: { x1: tr.x, y1: tr.y, x2: tr.x, y2: chartH, stroke: colors.warning, strokeWidth: 0.7, strokeDasharray: '2,2' },
    });
    svgChildren.push({ type: 'circle', props: { cx: tr.x, cy: tr.y, r: 3, fill: colors.warning } });
  }

  // Summary row helper
  function metricRow(label, value, dotColor) {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: '4px' },
        children: [
          {
            type: 'div',
            props: {
              style: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 },
              children: '',
            },
          },
          {
            type: 'span',
            props: { style: { fontSize: '10px', color: colors.onSurfaceMuted, flex: 1 }, children: label },
          },
          {
            type: 'span',
            props: { style: { fontSize: '12px', fontWeight: 700, color: dotColor }, children: String(value) },
          },
        ],
      },
    };
  }

  // Average
  const avg = numPoints > 0 ? (points.reduce((a, b) => a + b, 0) / numPoints).toFixed(1) : '0';

  const children = [
    // Title
    {
      type: 'span',
      props: {
        style: { fontSize: '12px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '4px' },
        children: '贡献概览',
      },
    },
    // Line chart
    {
      type: 'svg',
      props: { width: chartW, height: chartH, viewBox: `0 0 ${chartW} ${chartH}`, children: svgChildren },
    },
    // Legend: max / min / avg
    {
      type: 'div',
      props: {
        style: { display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '4px' },
        children: [
          {
            type: 'span',
            props: { style: { fontSize: '8px', color: colors.onSurfaceMuted }, children: '近30天' },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: '6px' },
              children: [
                { type: 'span', props: { style: { fontSize: '8px', color: colors.success }, children: `峰 ${rawMax}` } },
                { type: 'span', props: { style: { fontSize: '8px', color: colors.warning }, children: `谷 ${minVal}` } },
                { type: 'span', props: { style: { fontSize: '8px', color: colors.onSurfaceMuted }, children: `均 ${avg}` } },
              ],
            },
          },
        ],
      },
    },
    // Divider
    {
      type: 'div',
      props: { style: { width: '100%', height: '1px', backgroundColor: colors.surfaceBorder, marginBottom: '4px' }, children: '' },
    },
    // Metrics
    {
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', gap: '2px' },
        children: [
          metricRow('连续天数', `${data.currentStreak}天`, colors.primary),
          metricRow('最长连续', `${data.longestStreak}天`, colors.success),
          metricRow('总贡献数', data.totalContributions, colors.onSurface),
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
