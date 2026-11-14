/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0B0F19',
          900: '#0E1220',
          850: '#121828',
          800: '#161B26',
          700: '#1D2331',
          600: '#252C3D',
          500: '#313A50'
        },
        electric: {
          DEFAULT: '#8B5CF6',
          soft: '#A78BFA',
          bright: '#C4B5FD',
          dim: 'rgba(139, 92, 246, 0.15)',
          faint: 'rgba(139, 92, 246, 0.07)'
        },
        frost: {
          DEFAULT: '#F8FAFC',
          dim: '#94A3B8',
          faint: '#64748B'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.04em'
      },
      opacity: {
        8: '0.08',
        15: '0.15'
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 8s ease-in-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        }
      }
    }
  },
  plugins: []
}
