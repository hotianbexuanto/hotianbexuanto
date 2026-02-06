import { colors, shape, spacing, cardWidth, fontFamily } from './tokens.mjs';

/**
 * Render Top Languages Card - quarter width (194 x 260)
 * Compact list with color dots and percentages
 */
export function renderLanguages(languages, buildTime) {
  const rows = languages.slice(0, 6).map(lang => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        width: '100%',
      },
      children: [
        // Color dot
        {
          type: 'div',
          props: {
            style: {
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: lang.color || colors.primary,
              flexShrink: 0,
            },
            children: '',
          },
        },
        // Language name
        {
          type: 'span',
          props: {
            style: {
              fontSize: '11px',
              fontWeight: 500,
              color: colors.onSurface,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            children: lang.name,
          },
        },
        // Progress bar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '40px',
              height: '4px',
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: `${shape.cornerFull}px`,
              overflow: 'hidden',
              flexShrink: 0,
            },
            children: {
              type: 'div',
              props: {
                style: {
                  width: `${Math.min(lang.percent, 100)}%`,
                  height: '100%',
                  backgroundColor: lang.color || colors.primary,
                  borderRadius: `${shape.cornerFull}px`,
                },
                children: '',
              },
            },
          },
        },
        // Percentage
        {
          type: 'span',
          props: {
            style: {
              width: '32px',
              textAlign: 'right',
              fontSize: '10px',
              color: colors.onSurfaceMuted,
              flexShrink: 0,
            },
            children: `${lang.percent}%`,
          },
        },
      ],
    },
  }));

  const children = [
    // Header
    {
      type: 'span',
      props: {
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          marginBottom: '10px',
        },
        children: 'Languages',
      },
    },
    // Language rows
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        },
        children: rows,
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
