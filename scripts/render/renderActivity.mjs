import { colors, shape, spacing, cardWidth } from './tokens.mjs';

/**
 * Render Recent Activity Card - 390 x 180 (light fresh style)
 * Shows recent commits/PRs/issues
 */
export function renderActivity(activities) {
  const items = (activities || []).slice(0, 4);

  const typeIcons = {
    commit: { color: '#1A7F37', label: 'Commit' },
    pr: { color: '#B186D6', label: 'PR' },
    issue: { color: '#CF222E', label: 'Issue' },
  };

  const rows = items.length > 0 ? items.map(item => {
    const info = typeIcons[item.type] || typeIcons.commit;
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
        },
        children: [
          // Type badge
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                backgroundColor: `${info.color}18`,
                color: info.color,
                borderRadius: `${shape.cornerMd}px`,
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 600,
                flexShrink: 0,
                width: '50px',
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
                fontSize: '12px',
                color: colors.onSurface,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              children: item.message || '...',
            },
          },
          // Date
          {
            type: 'span',
            props: {
              style: {
                fontSize: '10px',
                color: colors.onSurfaceMuted,
                flexShrink: 0,
              },
              children: item.date || '',
            },
          },
        ],
      },
    };
  }) : [
    {
      type: 'span',
      props: {
        style: { fontSize: '13px', color: colors.onSurfaceMuted, textAlign: 'center' },
        children: 'No recent activity',
      },
    },
  ];

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
            style: { fontSize: '14px', fontWeight: 600, color: colors.onSurfaceVariant, marginBottom: '10px' },
            children: 'Recent Activity',
          },
        },
        // Activity items
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1,
              justifyContent: items.length === 0 ? 'center' : 'flex-start',
              alignItems: items.length === 0 ? 'center' : 'stretch',
            },
            children: rows,
          },
        },
      ],
    },
  };
}
