<script>
	import { onMount } from 'svelte';
	import { API, githubConfig } from '$lib/config.js';
	import { LoadIndex, showMenu } from '$lib/store.js';
	import Nav from '$lib/nav/Nav.svelte';
	
	import '../app.css';
	const toggleMenu = () => {
		showMenu.set(!$showMenu);
	};

	onMount(async function () {
		await LoadIndex(`${API}${githubConfig.indexfile}`);
	});
</script>

<div class="mx-auto h-screen w-full flex flex-row overflow-hidden maxx">
	<button on:click={toggleMenu} class="absolute top-0 right-0 sm:hidden"
		><img src="/assets/icons/menu.webp" alt="sidebar" /></button
	>
	<div class={'sm:block w-full sm:w-1/2 2xl:w-4/12 ' + ($showMenu ? 'block' : 'hidden')}>
		<Nav />
	</div>
	<main class={'overflow-y-scroll sm:block w-full lg:w-1/2 2xl:w-8/12 ' + ($showMenu ? 'hidden' : 'block')}>
		<slot />
	</main>
</div>