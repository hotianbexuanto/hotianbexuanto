import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Contribution Overview Card - quarter width (194 x 260)
 * Multi-line chart: daily, 7-day avg, previous period comparison
 */
export function renderStreak(data, buildTime) {
  const last30 = data.last30Days || new Array(30).fill(0);
  const prev30 = data.prev30Days || new Array(30).fill(0);

  // Compute 7-day rolling average
  const avg7 = last30.map((_, i) => {
    const start = Math.max(0, i - 6);
    const window = last30.slice(start, i + 1);
    return window.reduce((a, b) => a + b, 0) / window.length;
  });

  // Global max across all three series for shared Y-axis
  const allMax = Math.max(...last30, ...prev30, ...avg7, 1);

  // Chart dimensions
  const chartW = 158;
  const chartH = 100;
  const padL = 0;
  const padR = 0;
  const drawW = chartW - padL - padR;

  // Convert data series to SVG polyline points
  function toPoints(arr) {
    return arr.map((v, i) => {
      const x = padL + (i / (arr.length - 1)) * drawW;
      const y = chartH - (v / allMax) * (chartH - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  // Build SVG path for smooth curve (catmull-rom to cubic bezier)
  function toSmoothPath(arr) {
    const pts = arr.map((v, i) => ({
      x: padL + (i / (arr.length - 1)) * drawW,
      y: chartH - (v / allMax) * (chartH - 4) - 2,
    }));
    if (pts.length < 2) return '';
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  // Area fill path (for current 30d line)
  function toAreaPath(arr) {
    const pts = arr.map((v, i) => ({
      x: padL + (i / (arr.length - 1)) * drawW,
      y: chartH - (v / allMax) * (chartH - 4) - 2,
    }));
    if (pts.length < 2) return '';
    let d = `M${pts[0].x.toFixed(1)},${chartH}`;
    d += ` L${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    d += ` L${pts[pts.length - 1].x.toFixed(1)},${chartH} Z`;
    return d;
  }

  const curPath = toSmoothPath(last30);
  const avgPath = toSmoothPath(avg7);
  const prevPoints = toPoints(prev30);
  const areaPath = toAreaPath(last30);

  // Line definitions for the chart
  const lineColors = {
    current: colors.primary,        // #B186D6
    average: colors.success,        // #3FB950
    previous: colors.onSurfaceMuted, // #656D76
  };

  // Build the chart SVG children
  const chartChildren = [
    // Grid lines (3 horizontal)
    ...[0.25, 0.5, 0.75].map(pct => ({
      type: 'line',
      props: {
        x1: 0, y1: chartH * (1 - pct), x2: chartW, y2: chartH * (1 - pct),
        stroke: colors.surfaceBorder, strokeWidth: 0.5, strokeDasharray: '2,2',
      },
    })),
    // Area fill under current line
    { type: 'path', props: { d: areaPath, fill: `${colors.primary}15` } },
    // Previous period line (dashed, dim)
    { type: 'polyline', props: { points: prevPoints, fill: 'none', stroke: lineColors.previous, strokeWidth: 1, strokeDasharray: '3,3', opacity: 0.6 } },
    // 7-day average line (smooth, green)
    { type: 'path', props: { d: avgPath, fill: 'none', stroke: lineColors.average, strokeWidth: 1.5, opacity: 0.8 } },
    // Current period line (smooth, primary)
    { type: 'path', props: { d: curPath, fill: 'none', stroke: lineColors.current, strokeWidth: 2 } },
  ];

  // Legend item
  function legendItem(color, label, dashed) {
    const lineStyle = dashed
      ? { width: '12px', height: '0px', borderTop: `1.5px dashed ${color}`, flexShrink: 0, opacity: 0.7 }
      : { width: '12px', height: '0px', borderTop: `2px solid ${color}`, flexShrink: 0 };
    return {
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: '3px' },
        children: [
          { type: 'div', props: { style: lineStyle, children: '' } },
          { type: 'span', props: { style: { fontSize: '8px', color: colors.onSurfaceMuted }, children: label } },
        ],
      },
    };
  }

  // Metric pill
  function metricPill(label, value, color) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: '6px',
          padding: '3px 6px',
        },
        children: [
          { type: 'div', props: { style: { width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }, children: '' } },
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
        children: '贡献概览',
      },
    },
    // Metrics row
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          marginBottom: '6px',
        },
        children: [
          metricPill('连续', `${data.currentStreak}天`, colors.primary),
          metricPill('最长', `${data.longestStreak}天`, colors.success),
          metricPill('总计', data.totalContributions, colors.onSurface),
        ],
      },
    },
    // Legend row
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          gap: '6px',
          marginBottom: '4px',
        },
        children: [
          legendItem(lineColors.current, '近30天', false),
          legendItem(lineColors.average, '7日均', false),
          legendItem(lineColors.previous, '上月', true),
        ],
      },
    },
    // Multi-line chart
    {
      type: 'svg',
      props: {
        width: chartW,
        height: chartH,
        viewBox: `0 0 ${chartW} ${chartH}`,
        children: chartChildren,
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
