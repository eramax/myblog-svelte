<script>
	import Nav from '../components/nav.svelte';
	import { onMount } from 'svelte';
	import { API, githubConfig } from '../Lib/config.js';
	import { LoadIndex } from '../Lib/store.js';

	let showMenu = false;
	onMount(async function () {
		await LoadIndex(`${API}${githubConfig.indexfile}`);
	});
</script>

<div class="h-screen flex flex-row overflow-hidden">
	<div class="hidden sm:block w-1/2 2xl:w-5/12">
		<Nav />
	</div>
	<main class="h-screen overflow-y-scroll w-full ">
		<slot />
	</main>
</div>

<style>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
