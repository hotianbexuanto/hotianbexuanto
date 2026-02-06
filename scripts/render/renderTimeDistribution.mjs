import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Time Distribution Card - 390 x 260
 * Compact donut chart filling the card space
 */
export function renderTimeDistribution(hours, buildTime) {
  const total = hours.reduce((s, v) => s + v, 0) || 1;

  // Larger donut to fill space
  const svgSize = 160;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const outerR = 68;
  const innerR = 42;

  const periods = [
    { label: '深夜', range: [0, 4], color: '#6E40AA' },
    { label: '清晨', range: [4, 8], color: '#7E6DAF' },
    { label: '上午', range: [8, 12], color: '#B186D6' },
    { label: '下午', range: [12, 16], color: '#C9A7E4' },
    { label: '傍晚', range: [16, 20], color: '#E0C8F0' },
    { label: '夜晚', range: [20, 24], color: '#9B5FC0' },
  ];

  const segments = periods.map(p => {
    let count = 0;
    for (let h = p.range[0]; h < p.range[1]; h++) count += hours[h];
    return { ...p, count, percent: count / total };
  });

  const peak = segments.reduce((a, b) => a.count > b.count ? a : b);

  function donutSegment(cx, cy, outerR, innerR, startAngle, endAngle) {
    const gap = 2;
    const sa = startAngle + gap / 2;
    const ea = endAngle - gap / 2;
    if (ea <= sa) return '';
    const sRO = (sa - 90) * Math.PI / 180;
    const eRO = (ea - 90) * Math.PI / 180;
    const x1 = cx + outerR * Math.cos(sRO), y1 = cy + outerR * Math.sin(sRO);
    const x2 = cx + outerR * Math.cos(eRO), y2 = cy + outerR * Math.sin(eRO);
    const x3 = cx + innerR * Math.cos(eRO), y3 = cy + innerR * Math.sin(eRO);
    const x4 = cx + innerR * Math.cos(sRO), y4 = cy + innerR * Math.sin(sRO);
    const la = (ea - sa) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${la} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${la} 0 ${x4} ${y4} Z`;
  }

  let currentAngle = 0;
  const arcs = segments.map(seg => {
    const angle = seg.percent * 360;
    const path = donutSegment(cx, cy, outerR, innerR, currentAngle, currentAngle + angle);
    currentAngle += angle;
    return { type: 'path', props: { d: path, fill: seg.color } };
  });

  // Legend: 2-column grid layout
  const legendRows = [];
  for (let i = 0; i < segments.length; i += 2) {
    const pair = segments.slice(i, i + 2).map(seg => ({
      type: 'div',
      props: {
        style: { display: 'flex', alignItems: 'center', gap: '3px', flex: 1 },
        children: [
          { type: 'div', props: { style: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0 }, children: '' } },
          { type: 'span', props: { style: { fontSize: '9px', color: colors.onSurfaceMuted }, children: `${seg.label} ${Math.round(seg.percent * 100)}%` } },
        ],
      },
    }));
    legendRows.push({
      type: 'div',
      props: { style: { display: 'flex', gap: '8px' }, children: pair },
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
      children: [
        // Title row
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
            children: [
              { type: 'span', props: { style: { fontSize: '12px', fontWeight: 600, color: colors.onSurfaceVariant }, children: '时间分布' } },
              { type: 'div', props: { style: { display: 'flex', backgroundColor: colors.primaryContainer, color: colors.primary, borderRadius: `${shape.cornerFull}px`, padding: '2px 8px', fontSize: '9px', fontWeight: 600 }, children: `高峰: ${peak.label}` } },
            ],
          },
        },
        // Main content: donut + right panel
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', flex: 1, gap: '8px' },
            children: [
              // Donut
              {
                type: 'div',
                props: {
                  style: { display: 'flex', position: 'relative', width: `${svgSize}px`, height: `${svgSize}px`, flexShrink: 0 },
                  children: [
                    { type: 'svg', props: { width: svgSize, height: svgSize, viewBox: `0 0 ${svgSize} ${svgSize}`, children: arcs } },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '0', left: '0', width: `${svgSize}px`, height: `${svgSize}px` },
                        children: [
                          { type: 'span', props: { style: { fontSize: '16px', fontWeight: 700, color: colors.onSurface }, children: String(total) } },
                          { type: 'span', props: { style: { fontSize: '9px', color: colors.onSurfaceMuted }, children: 'commits' } },
                        ],
                      },
                    },
                  ],
                },
              },
              // Right: legend grid + stats
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', flex: 1, gap: '6px', justifyContent: 'center' },
                  children: [
                    ...legendRows,
                    // Period counts
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px', padding: '6px', backgroundColor: colors.surfaceContainerHigh, borderRadius: `${shape.cornerMd}px` },
                        children: segments.filter(s => s.count > 0).slice(0, 3).map(seg => ({
                          type: 'div',
                          props: {
                            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                            children: [
                              { type: 'span', props: { style: { fontSize: '9px', color: colors.onSurfaceMuted }, children: `${seg.label} (${seg.range[0]}:00-${seg.range[1]}:00)` } },
                              { type: 'span', props: { style: { fontSize: '10px', fontWeight: 600, color: seg.color }, children: String(seg.count) } },
                            ],
                          },
                        })),
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Build time - always bottom right
        ...(buildTime ? [{
          type: 'span',
          props: {
            style: { fontSize: '8px', color: colors.onSurfaceMuted, textAlign: 'right', marginTop: 'auto' },
            children: `Updated: ${buildTime}`,
          },
        }] : []),
      ],
    },
  };
}
