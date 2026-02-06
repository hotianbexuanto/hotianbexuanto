import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Contribution Overview Card - quarter width (194 x 260)
 * Shows: current streak, longest streak, total + mini bar chart
 */
export function renderStreak(data, buildTime) {
  const last30 = data.last30Days || new Array(30).fill(0);
  const maxVal = Math.max(...last30, 1);

  // Mini bar chart (last 10 days for quarter width)
  const last10 = last30.slice(-10);
  const barWidth = 10;
  const barGap = 3;
  const chartHeight = 50;
  const chartStartX = 10;

  const bars = last10.map((v, i) => ({
    type: 'rect',
    props: {
      x: chartStartX + i * (barWidth + barGap),
      y: chartHeight - (v / maxVal) * chartHeight,
      width: barWidth,
      height: Math.max((v / maxVal) * chartHeight, 2),
      rx: 2,
      fill: v > 0 ? colors.primary : colors.surfaceContainerHigh,
      opacity: v > 0 ? (0.4 + 0.6 * (v / maxVal)) : 1,
    },
  }));

  function metricItem(label, value) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        },
        children: [
          {
            type: 'span',
            props: {
              style: { fontSize: '18px', fontWeight: 700, color: colors.primary },
              children: String(value),
            },
          },
          {
            type: 'span',
            props: {
              style: { fontSize: '9px', color: colors.onSurfaceVariant, marginTop: '2px' },
              children: label,
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
        style: { fontSize: '12px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '8px' },
        children: 'Contributions',
      },
    },
    // Metrics row
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          justifyContent: 'space-around',
          padding: '6px 0',
          borderBottom: `1px solid ${colors.surfaceBorder}`,
          marginBottom: '10px',
        },
        children: [
          metricItem('Streak', data.currentStreak),
          metricItem('Best', data.longestStreak),
          metricItem('Total', data.totalContributions),
        ],
      },
    },
    // Mini bar chart label
    {
      type: 'span',
      props: {
        style: { fontSize: '9px', color: colors.onSurfaceMuted, marginBottom: '4px' },
        children: 'Last 10 Days',
      },
    },
    // Mini bar chart
    {
      type: 'svg',
      props: {
        width: 140,
        height: chartHeight,
        viewBox: `0 0 140 ${chartHeight}`,
        children: bars,
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
