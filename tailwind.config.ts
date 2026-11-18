import type { Config } from 'tailwindcss';
const v = (n: string) => `var(--${n})`;
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: v('bg'), card: v('card'), ink: v('ink'), mute: v('mute'), acc: v('acc'), acc2: v('acc2'), line: v('line'), soft: v('soft'), on: v('on'), hi: v('hi'), mid: v('mid'), lo: v('lo') },
      fontFamily: { serif: ['var(--font-serif)', '"Instrument Serif"', 'Georgia', 'serif'], sans: ['"Inter Variable"', 'Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
