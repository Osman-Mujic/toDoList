import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: 'esnext',
		rollupOptions: {
			external: ['@node-rs/argon2-wasm32-wasi', 'node:async_hooks']
		}
	},
	plugins: [paraglide({ project: './project.inlang', outdir: './src/lib/paraglide' }), sveltekit()]
});
