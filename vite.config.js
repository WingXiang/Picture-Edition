import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 確保編譯後的資源路徑使用相對路徑，以支援 GitHub Pages 部署
})
