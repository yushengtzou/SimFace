import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',  // 包含根目錄下的 index.html
    './src/**/*.{html,js,ts,jsx,tsx}',  // 包含 src 目錄下的所有相關文件類型
  ],
  theme: {
    extend: {
      // 這裡可以擴展 Tailwind 的默認主題，例如新增顏色、字體、間距等
      colors: {
        primary: '#1DA1F2',  // 自定義主色
        secondary: '#14171A',  // 自定義次色
      backgroundColor: {
        'custom-white': '#F7F7F7',
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],  // 自定義無襯線字體
        serif: ['Merriweather', 'serif'],  // 自定義襯線字體
      },
    },
  },
  plugins: [
    // 在這裡添加 Tailwind CSS 插件，例如表單、排版等
  ],
}

export default config satisfies Config;
