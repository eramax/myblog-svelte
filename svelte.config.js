import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		prerender: {
			enabled: true
		  },
		ssr: false,
		adapter: adapter({
			fallback: 'index.html'
		}),
		vite: {
			ssr: {
				target:  'webworker'
			},
			optimizeDeps: {
			  include: ['@toast-ui/editor']
			}
		}
	}
};

export default config;
