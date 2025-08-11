import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // remove if not using React

export default defineConfig({
  plugins: [react()],
  base: '/auburnrockets28/',   // <-- replace with your repo name
})
