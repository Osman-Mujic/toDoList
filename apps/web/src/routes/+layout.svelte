<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	export let data: LayoutData;
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	<slot />
	<SvelteQueryDevtools />
</QueryClientProvider>
