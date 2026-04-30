/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ─── Amparo design tokens ───────────────────────
        primary:   '#1D9E75',   // Verde Amparo — CTAs
        dark:      '#085041',   // Verde profundo — headers
        light:     '#E1F5EE',   // Verde suave — fundos
        amber:     '#EF9F27',   // Avaliações
        surface:   '#F5F5F2',   // Background do app
        danger:    '#E24B4A',   // Emergência / erros
        // ─── Neutros ────────────────────────────────────
        muted:     '#888888',
        border:    '#E8E8E4',
        card:      '#FFFFFF',
      },
      fontFamily: {
        sans:  ['System'],
        mono:  ['Courier'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg:      '20px',
        full:    '9999px',
      },
    },
  },
  plugins: [],
};
