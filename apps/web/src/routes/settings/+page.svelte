<script lang="ts">
	import type { PageData } from './$types.js';
	import SettingsForm from './settings-form.svelte';
	export let data: PageData;

	let submittedData: {
		id: string;
		taskName: string;
		startTime: string;
		endTime: string;
	}[] = [];
</script>

<SettingsForm data={data.form} {submittedData} />
