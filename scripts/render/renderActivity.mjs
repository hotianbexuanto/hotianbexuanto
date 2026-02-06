import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Recent Activity Card - quarter width (194 x 260)
 * Shows recent commits/PRs/issues in compact form
 */
export function renderActivity(activities, buildTime) {
  const items = (activities || []).slice(0, 4);

  const typeIcons = {
    commit: { color: '#1A7F37', label: 'C' },
    pr: { color: '#B186D6', label: 'P' },
    issue: { color: '#CF222E', label: 'I' },
  };

  const rows = items.length > 0 ? items.map(item => {
    const info = typeIcons[item.type] || typeIcons.commit;
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          width: '100%',
        },
        children: [
          // Type badge (compact single letter)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                backgroundColor: `${info.color}18`,
                color: info.color,
                borderRadius: `${shape.cornerSm}px`,
                padding: '1px 4px',
                fontSize: '9px',
                fontWeight: 600,
                flexShrink: 0,
                width: '16px',
                justifyContent: 'center',
              },
              children: info.label,
            },
          },
          // Message
          {
            type: 'span',
            props: {
              style: {
                fontSize: '10px',
                color: colors.onSurface,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              children: item.message || '...',
            },
          },
        ],
      },
    };
  }) : [
    {
      type: 'span',
      props: {
        style: { fontSize: '11px', color: colors.onSurfaceMuted, textAlign: 'center' },
        children: 'No recent activity',
      },
    },
  ];

  const children = [
    // Title
    {
      type: 'span',
      props: {
        style: { fontSize: '12px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '8px' },
        children: 'Activity',
      },
    },
    // Activity items
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: 1,
          justifyContent: items.length === 0 ? 'center' : 'flex-start',
          alignItems: items.length === 0 ? 'center' : 'stretch',
        },
        children: rows,
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
