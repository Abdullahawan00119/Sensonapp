/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: In NativeWind v4, we define the content paths where tailwind is used.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'bg-void': '#070712',
        'bg-deep': '#0A0A14',
        'bg-surface': '#12121E',
        'bg-elevated': '#1A1A2E',
        'bg-glass': 'rgba(255,255,255,0.04)',
        'accent-indigo': '#4F46E5',
        'accent-violet': '#7C3AED',
        'accent-soft': '#818CF8',
        'status-ok': '#22C55E',
        'status-warn': '#F59E0B',
        'status-crit': '#EF4444',
        'status-info': '#06B6D4',
        'text-primary': '#F2F2FC',
        'text-secondary': '#CACAE0',
        'text-muted': '#C4C4DC',
      },
      fontFamily: {
        brand: ['Outfit_400Regular'],
        'brand-medium': ['Outfit_500Medium'],
        'brand-semibold': ['Outfit_600SemiBold'],
        'brand-bold': ['Outfit_700Bold'],
        body: ['DMSans_400Regular'],
        'body-medium': ['DMSans_500Medium'],
        'body-bold': ['DMSans_700Bold'],
      },
      fontSize: {
        xs: ['10px', { lineHeight: '14px' }],
        sm: ['12px', { lineHeight: '16px' }],
        base: ['14px', { lineHeight: '18px' }],
        md: ['16px', { lineHeight: '22px' }],
        lg: ['20px', { lineHeight: '26px' }],
        xl: ['24px', { lineHeight: '30px' }],
        '2xl': ['30px', { lineHeight: '36px' }],
        '3xl': ['38px', { lineHeight: '46px' }],
      },
    },
  },
  plugins: [],
}
