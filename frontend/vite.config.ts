import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://r.stripe.com https://api.stripe.com https://checkout.stripe.com https://*.stripe.com;",
        "connect-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000 https://js.stripe.com https://r.stripe.com https://api.stripe.com https://checkout.stripe.com https://*.stripe.com wss://*.stripe.com ws://*.stripe.com;",
        "frame-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://r.stripe.com https://*.stripe.com;",
        "img-src 'self' 'unsafe-inline' data: https: blob:;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.stripe.com;",
        "font-src 'self' 'unsafe-inline' https://fonts.gstatic.com https://*.stripe.com;",
        "frame-ancestors 'self';",
        "base-uri 'self';",
        "form-action 'self';"
      ].join(' ')
    }
  },
})
