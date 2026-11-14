import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // imports the Tailwind plugin

export default defineConfig({
  plugins: [react(), tailwindcss()], // tells Vite to use React and Tailwind
})