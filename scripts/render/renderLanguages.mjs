import { colors, shape, spacing, cardWidth } from './tokens.mjs';

/**
 * Render Top Languages Card - 800 x 260 (light fresh style)
 * Shows more languages with color dots and byte count
 */
export function renderLanguages(languages) {
  const rows = languages.map(lang => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
      },
      children: [
        // Color dot
        {
          type: 'div',
          props: {
            style: {
              width: '10px',
              height: '10px',
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
              width: '90px',
              fontSize: '14px',
              fontWeight: 500,
              color: colors.onSurface,
              flexShrink: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            children: lang.name,
          },
        },
        // Progress bar track
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              height: '6px',
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: `${shape.cornerFull}px`,
              overflow: 'hidden',
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
              width: '45px',
              textAlign: 'right',
              fontSize: '12px',
              color: colors.onSurfaceMuted,
              fontFamily: 'monospace',
              flexShrink: 0,
            },
            children: `${lang.percent}%`,
          },
        },
      ],
    },
  }));

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
        // Header
        {
          type: 'span',
          props: {
            style: {
              fontSize: '14px',
              fontWeight: 600,
              color: colors.onSurfaceVariant,
              marginBottom: '14px',
            },
            children: 'Most Used Languages',
          },
        },
        // Language rows
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1,
            },
            children: rows,
          },
        },
      ],
    },
  };
}
