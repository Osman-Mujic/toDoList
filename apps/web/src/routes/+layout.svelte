<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	import type { LayoutData } from './$types';
	import '../app.css';
	export let data: LayoutData;
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { ModeWatcher } from 'mode-watcher';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import NavBar from './NavBar.svelte';
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

<ParaglideJS {i18n}>
	<QueryClientProvider client={queryClient}>
		<ModeWatcher />
		<NavBar />
		<slot />
		<SvelteQueryDevtools />
	</QueryClientProvider>
</ParaglideJS>
