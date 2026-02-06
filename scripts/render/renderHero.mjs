import { colors, shape, spacing, cardWidth } from './tokens.mjs';

/**
 * Render Hero Banner - JSX tree for Satori
 * 800 x 200
 */
export function renderHero(data) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: `${cardWidth.full}px`,
        height: '200px',
        backgroundColor: colors.surfaceContainer,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: `${shape.cornerXl}px`,
        padding: `${spacing.lg}px ${spacing.xxl}px`,
        fontFamily: 'Inter, sans-serif',
        color: colors.onSurface,
        alignItems: 'center',
        gap: `${spacing.lg}px`,
      },
      children: [
        // Avatar
        {
          type: 'div',
          props: {
            style: {
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `3px solid ${colors.primary}`,
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
            },
            children: data.avatarUrl
              ? {
                  type: 'img',
                  props: {
                    src: data.avatarUrl,
                    width: 120,
                    height: 120,
                    style: { objectFit: 'cover' },
                  },
                }
              : {
                  type: 'div',
                  props: {
                    style: {
                      width: '100%',
                      height: '100%',
                      backgroundColor: colors.primaryContainer,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      color: colors.primary,
                    },
                    children: data.name.charAt(0).toUpperCase(),
                  },
                },
          },
        },
        // Text content
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: `${spacing.xs}px`,
              flex: 1,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '32px', fontWeight: 700 },
                  children: data.name,
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', color: colors.primary },
                  children: `@${data.login}`,
                },
              },
              data.bio
                ? {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '16px',
                        color: colors.onSurfaceVariant,
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      children: data.bio,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // Stats pills
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: `${spacing.sm}px`,
              alignItems: 'flex-end',
            },
            children: [
              pillBadge(`${data.repos} repos`),
              pillBadge(`${data.followers} followers`),
            ],
          },
        },
      ],
    },
  };
}

function pillBadge(text) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        backgroundColor: colors.primaryContainer,
        color: colors.primary,
        borderRadius: `${shape.cornerFull}px`,
        padding: `${spacing.xs}px ${spacing.md}px`,
        fontSize: '14px',
        fontWeight: 600,
      },
      children: text,
    },
  };
}
