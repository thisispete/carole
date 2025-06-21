import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Proxy Databricks API calls to avoid CORS issues
			'/api/databricks': {
				target: 'https://block-lakehouse-production.cloud.databricks.com',
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path.replace(/^\/api\/databricks/, ''),
				configure: (proxy, options) => {
					proxy.on('proxyReq', (proxyReq, req, res) => {
						// Forward authentication cookies
						if (req.headers.cookie) {
							proxyReq.setHeader('Cookie', req.headers.cookie);
						}
						// Add required headers
						proxyReq.setHeader('Origin', 'https://block-lakehouse-production.cloud.databricks.com');
					});
				}
			}
		}
	}
});