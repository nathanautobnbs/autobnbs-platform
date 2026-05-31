import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      colors: {
        brand: {
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          yellow: '#eab308',
          purple: '#a855f7',
          orange: '#f97316',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-red-50', 'bg-red-100', 'bg-red-500', 'bg-red-600',
    'text-red-500', 'text-red-600', 'text-red-700',
    'border-red-200', 'border-red-500',
    'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-600',
    'text-green-500', 'text-green-600', 'text-green-700',
    'border-green-200', 'border-green-500',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600',
    'text-blue-500', 'text-blue-600', 'text-blue-700',
    'border-blue-200', 'border-blue-500',
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-500', 'bg-yellow-600',
    'text-yellow-500', 'text-yellow-600', 'text-yellow-700',
    'border-yellow-200', 'border-yellow-500',
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600',
    'text-purple-500', 'text-purple-600', 'text-purple-700',
    'border-purple-200', 'border-purple-500',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600',
    'text-orange-500', 'text-orange-600', 'text-orange-700',
    'border-orange-200', 'border-orange-500',
    'bg-gray-50', 'bg-gray-900',
    'text-gray-900',
  ],
};

export default config;
