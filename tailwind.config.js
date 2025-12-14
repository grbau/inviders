/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
        },
        grey: {
          50: 'var(--color-grey-50)',
          100: 'var(--color-grey-100)',
          200: 'var(--color-grey-200)',
          300: 'var(--color-grey-300)',
          400: 'var(--color-grey-400)',
          500: 'var(--color-grey-500)',
          700: 'var(--color-grey-700)',
          900: 'var(--color-grey-900)',
        },
        success: {
          50: 'var(--color-success-50)',
          500: 'var(--color-success-500)',
          700: 'var(--color-success-700)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          500: 'var(--color-warning-500)',
          700: 'var(--color-warning-700)',
        },
        error: {
          50: 'var(--color-error-50)',
          500: 'var(--color-error-500)',
          700: 'var(--color-error-700)',
        },
      },
      fontFamily: {
        sans: 'var(--font-family-sans)',
        mono: 'var(--font-family-mono)',
      },
      fontSize: {
        'h1': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)', fontWeight: 'var(--font-weight-bold)' }],
        'h2': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)', fontWeight: 'var(--font-weight-semibold)' }],
        'h3': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-normal)', fontWeight: 'var(--font-weight-semibold)' }],
        'body': ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)', fontWeight: 'var(--font-weight-normal)' }],
        'small': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)', fontWeight: 'var(--font-weight-normal)' }],
      },
      spacing: {
        '0': 'var(--spacing-0)',
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'card': 'var(--radius-xl)',
        'button': 'var(--radius-lg)',
        'input': 'var(--radius-md)',
        'chip': 'var(--radius-2xl)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'card': 'var(--shadow-card)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'focus': 'var(--shadow-focus)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal': 'var(--z-modal)',
        'tooltip': 'var(--z-tooltip)',
      },
      height: {
        'input': 'var(--size-input-height)',
        'button': 'var(--size-button-height)',
        'avatar': 'var(--size-avatar)',
      },
      width: {
        'avatar': 'var(--size-avatar)',
      },
    },
  },
  plugins: [],
}
