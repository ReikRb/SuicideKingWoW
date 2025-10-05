import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Make MUI use styled-components instead of emotion
      '@mui/styled-engine': '@mui/styled-engine-sc'
    }
  }
})
