import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Picture-Edition/', // GitHub Pages 專屬設定，對應你的倉庫名稱
})
