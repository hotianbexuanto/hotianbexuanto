import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Time Distribution Card - 390 x 260
 * Donut/ring chart showing commit hour distribution over the past year
 */
export function renderTimeDistribution(hours, buildTime) {
  const total = hours.reduce((s, v) => s + v, 0) || 1;

  // SVG donut chart parameters
  const svgSize = 180;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const outerR = 72;
  const innerR = 45;

  // Group hours into 6 time periods for donut segments
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
    for (let h = p.range[0]; h < p.range[1]; h++) {
      count += hours[h];
    }
    return { ...p, count, percent: count / total };
  });

  const peak = segments.reduce((a, b) => a.count > b.count ? a : b);

  function donutSegment(cx, cy, outerR, innerR, startAngle, endAngle) {
    const gap = 2;
    const sa = startAngle + gap / 2;
    const ea = endAngle - gap / 2;
    if (ea <= sa) return '';

    const startRadO = (sa - 90) * Math.PI / 180;
    const endRadO = (ea - 90) * Math.PI / 180;

    const x1 = cx + outerR * Math.cos(startRadO);
    const y1 = cy + outerR * Math.sin(startRadO);
    const x2 = cx + outerR * Math.cos(endRadO);
    const y2 = cy + outerR * Math.sin(endRadO);
    const x3 = cx + innerR * Math.cos(endRadO);
    const y3 = cy + innerR * Math.sin(endRadO);
    const x4 = cx + innerR * Math.cos(startRadO);
    const y4 = cy + innerR * Math.sin(startRadO);

    const largeArc = (ea - sa) > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  let currentAngle = 0;
  const arcs = segments.map(seg => {
    const angle = seg.percent * 360;
    const path = donutSegment(cx, cy, outerR, innerR, currentAngle, currentAngle + angle);
    currentAngle += angle;
    return {
      type: 'path',
      props: {
        d: path,
        fill: seg.color,
      },
    };
  });

  // Legend items
  const legendItems = segments.map(seg => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: seg.color,
              flexShrink: 0,
            },
            children: '',
          },
        },
        {
          type: 'span',
          props: {
            style: { fontSize: '10px', color: colors.onSurfaceMuted },
            children: `${seg.label} ${Math.round(seg.percent * 100)}%`,
          },
        },
      ],
    },
  }));

  const children = [
    // Title
    {
      type: 'span',
      props: {
        style: { fontSize: '14px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '8px' },
        children: '时间分布',
      },
    },
    // Content row: donut + legend
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          gap: '16px',
        },
        children: [
          // Donut container (relative position for center text overlay)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                position: 'relative',
                width: `${svgSize}px`,
                height: `${svgSize}px`,
                flexShrink: 0,
              },
              children: [
                // SVG donut arcs only
                {
                  type: 'svg',
                  props: {
                    width: svgSize,
                    height: svgSize,
                    viewBox: `0 0 ${svgSize} ${svgSize}`,
                    children: arcs,
                  },
                },
                // Center text overlay
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: `${svgSize}px`,
                      height: `${svgSize}px`,
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '18px', fontWeight: 700, color: colors.onSurface },
                          children: String(total),
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '10px', color: colors.onSurfaceMuted },
                          children: 'commits',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // Legend + peak info
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                flex: 1,
              },
              children: [
                ...legendItems,
                // Peak indicator
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      marginTop: '8px',
                      backgroundColor: colors.primaryContainer,
                      color: colors.primary,
                      borderRadius: `${shape.cornerFull}px`,
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                    },
                    children: `高峰: ${peak.label} (${peak.count})`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];

  if (buildTime) {
    children.push({
      type: 'span',
      props: {
        style: { fontSize: '9px', color: colors.onSurfaceMuted, textAlign: 'right', marginTop: '4px' },
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
        padding: `${spacing.lg}px`,
        fontFamily,
        color: colors.onSurface,
      },
      children,
    },
  };
}
