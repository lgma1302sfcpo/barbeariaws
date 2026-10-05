import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pageMetadata, renderHead } from './src/lib/seo.js'

export default defineConfig({
  plugins: [react(), {
    name: 'development-seo-head',
    apply: 'serve',
    transformIndexHtml(html, context) {
      const pathname = context.path || '/'
      return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->${renderHead(pageMetadata(pathname))}<!--seo:end-->`)
    },
  }],
  server: {
    proxy: {
      '/api': 'http://localhost:4242',
    },
  },
})
