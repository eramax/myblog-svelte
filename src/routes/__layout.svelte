<script>
	import Nav from '../components/Nav.svelte';
	import { onMount } from 'svelte';
	import { API, githubConfig } from '../Lib/config.js';
	import { LoadIndex,showMenu } from '../Lib/store.js';

	onMount(async function () {
		await LoadIndex(`${API}${githubConfig.indexfile}`);
	});
</script>

<div class="h-screen flex flex-row overflow-hidden">
	<Nav />
	<main class={"h-screen overflow-y-scroll " + ($showMenu? 'hidden': 'w-full') }>
		<slot />
	</main>
</div>

<style>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
