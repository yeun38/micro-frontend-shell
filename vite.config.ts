import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          chat: `${env.VITE_CHAT_URL || 'http://localhost:3011'}/assets/remoteEntry.js`,
          mfeHost: `${env.VITE_MFE_HOST_URL || 'https://dusunax-001.web.app'}/assets/remoteEntry.js`,
          archive: `${env.VITE_ARCHIVE_URL || 'https://archive-dusunax-001.web.app'}/assets/remoteEntry.js`,
          auth: `${env.VITE_AUTH_URL || 'https://auth-dusunax-001.web.app'}/assets/remoteEntry.js`,
        },
        shared: ['react', 'react-dom', 'react-router-dom'],
      }),
    ],
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
  }
})
