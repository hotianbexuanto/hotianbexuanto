import { colors, shape, spacing, cardWidth } from './tokens.mjs';

/**
 * Render Contribution Overview Card - 390 x 260 (replaces ugly streak card)
 * Shows: current streak, longest streak, total contributions, and a mini bar chart
 */
export function renderStreak(data) {
  const last30 = data.last30Days || new Array(30).fill(0);
  const maxVal = Math.max(...last30, 1);

  // Mini bar chart (last 14 days to fit in half-width)
  const last14 = last30.slice(-14);
  const barWidth = 16;
  const barGap = 4;
  const chartHeight = 60;
  const chartStartX = 24;

  const bars = last14.map((v, i) => ({
    type: 'rect',
    props: {
      x: chartStartX + i * (barWidth + barGap),
      y: chartHeight - (v / maxVal) * chartHeight,
      width: barWidth,
      height: Math.max((v / maxVal) * chartHeight, 2),
      rx: 3,
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
              style: { fontSize: '22px', fontWeight: 700, color: colors.primary },
              children: String(value),
            },
          },
          {
            type: 'span',
            props: {
              style: { fontSize: '11px', color: colors.onSurfaceVariant, marginTop: '2px' },
              children: label,
            },
          },
        ],
      },
    };
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
        fontFamily: 'Inter, sans-serif',
        color: colors.onSurface,
      },
      children: [
        // Title
        {
          type: 'span',
          props: {
            style: { fontSize: '14px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '12px' },
            children: 'Contribution Overview',
          },
        },
        // Metrics row
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-around',
              padding: '8px 0',
              borderBottom: `1px solid ${colors.surfaceBorder}`,
              marginBottom: '14px',
            },
            children: [
              metricItem('Current Streak', data.currentStreak),
              metricItem('Longest Streak', data.longestStreak),
              metricItem('Total', data.totalContributions),
            ],
          },
        },
        // Mini bar chart label
        {
          type: 'span',
          props: {
            style: { fontSize: '11px', color: colors.onSurfaceMuted, marginBottom: '6px' },
            children: 'Last 14 Days',
          },
        },
        // Mini bar chart
        {
          type: 'svg',
          props: {
            width: 330,
            height: chartHeight,
            viewBox: `0 0 330 ${chartHeight}`,
            children: bars,
          },
        },
      ],
    },
  };
}
