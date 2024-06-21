import type { Config } from 'tailwindcss'


export default {
  content: [
    './index.html',  // Include index.html in the root directory
    './src/**/*.{html,js,ts,jsx,tsx}',  // Include all relevant file types in the src directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
