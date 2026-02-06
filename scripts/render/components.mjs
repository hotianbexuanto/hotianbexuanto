import { colors, shape, spacing } from './tokens.mjs';

/** Base card wrapper for MD3 style */
export function BaseCard({ children, width = 800, height = 200 }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: colors.surfaceContainer,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: `${shape.cornerXl}px`,
        padding: `${spacing.lg}px`,
        fontFamily: 'Inter, sans-serif',
        color: colors.onSurface,
      },
      children,
    },
  };
}

/** Icon circle container */
export function IconCircle({ children, size = 48 }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: colors.primaryContainer,
        color: colors.primary,
        flexShrink: 0,
      },
      children,
    },
  };
}

/** Stat item: icon + label + value */
export function StatItem({ label, value, icon }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: `${spacing.sm + 4}px`,
        flex: '1 1 45%',
        minWidth: '150px',
      },
      children: [
        IconCircle({ children: icon, size: 44 }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '12px', color: colors.onSurfaceVariant },
                  children: label,
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '20px', fontWeight: 700 },
                  children: String(value),
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** Progress bar for languages */
export function ProgressBar({ percent, color = colors.primary, height = 8 }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flex: 1,
        height: `${height}px`,
        backgroundColor: colors.surfaceBorder,
        borderRadius: `${shape.cornerSm}px`,
        overflow: 'hidden',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              width: `${Math.min(percent, 100)}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: `${shape.cornerSm}px`,
            },
            children: '',
          },
        },
      ],
    },
  };
}
