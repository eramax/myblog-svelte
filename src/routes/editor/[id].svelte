<script context="module">
    export async function load(ctx) {
        let slug = ctx.page.params.id;
        return { props: { slug }}
    }
</script>

<script>
	import { onMount } from 'svelte';
	import { BlogStore } from '$lib/store.js';
	import { githubConfig, API } from '$lib/config.js';
	import { LoadPost } from '$lib/store.js';
	import 'jodit/build/jodit.min.css';

	export let slug = 'new';
	let post = undefined;
	let access_token = localStorage.getItem('access_token') || '';
	$: localStorage.setItem('access_token', access_token);

	let editor;
	let area;
	let title;
	let cats = [0];
	let newCat = '';

	async function save() {
		if (editor.value && cats && title && access_token) {
			if (newCat) {
				let catId = BlogStore.addCategory(newCat);
				cats.indexOf(catId) === -1 && cats.push(catId);
			}
			post = {
				date: (post && post.date) || Math.floor(Date.now() / 1000),
				cats: cats || [0],
				content: editor.value,
				title: title,
				slug: (post && post.slug) || undefined
			};
			await BlogStore.savePost(post);
		}
	}


	onMount(async () => {
		editor = Jodit.make(area, {
			askBeforePasteHTML: false,
			processPasteHTML: true,
			removeEmptyBlocks: false,
			defaultActionOnPaste: 'insert_clear_html',
			height: '60vh',
			uploader: {
				insertImageAsBase64URI: true
			},
			events: {
				change: function (n) {}
			}
		});
		if (slug && slug !== 'new') {
			post = await LoadPost(`${API}${githubConfig.postdir}${slug}.json`);
			if (post) {
				editor.value = post.content;
				title = post.title;
				cats = post.cats;
			}
		}
	});
</script>

<section class="w-full">
	<header class="border-b-2 border-yellow-500 p-4">
		<div class="capitalize text-3xl font-bold mb-2 ">Post Editor</div>
	</header>

	<form class="w-full py-4 px-8">
		<div class="w-full flex mb-6">
			<div class="w-32">
				<label class="block text-gray-500 font-bold mb-1 pr-4" for="title"> Post title </label>
			</div>
			<div class="w-full">
				<input
					bind:value={title}
					class="bg-gray-200 appearance-none border-2 w-full border-gray-200 rounded  py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
					id="title"
					type="text"
				/>
			</div>
		</div>

		<textarea bind:this={area} />

		<div class="w-full flex mt-4 mb-6">
			<div class="w-32">
				<label class="block text-gray-500 font-bold mb-1 pr-4" for="title"> Tags </label>
			</div>
			<div class="block mt-2">
			{#each $BlogStore.cats as cat}
			<div>
				<label class="inline-flex items-center">
				  <input bind:group={cats} value={cat.id} type="checkbox" class="form-checkbox" checked>
				  <span class="ml-2">{cat.name}</span>
				</label>
			  </div>
		  {/each}
		</div>
		</div>

		<div class="w-full flex mb-6">
			<div class="w-64">
				<label class="block text-gray-500 font-bold mb-1 pr-4 fon" for="newCat"> New Tag </label>
			</div>
			<div class="w-full">
				<input
					bind:value={newCat}
					class="bg-gray-200 appearance-none border-2 w-full border-gray-200 rounded  py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
					id="newCat"
					type="text"
				/>
			</div>
		</div>

		<div class="w-full flex mb-6">
			<div class="w-64">
				<label class="block text-gray-500 font-bold mb-1 pr-4 fon" for="access_token">
					Github access token
				</label>
			</div>
			<div class="w-full">
				<input
					bind:value={access_token}
					class="bg-gray-200 appearance-none border-2 w-full border-gray-200 rounded  py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
					id="access_token"
					type="text"
				/>
			</div>
		</div>

		<div class="flex items-center mb-32">
			<div class="w-1/3" />
			<div class="w-2/3">
				<button
					on:click|preventDefault={save}
					class="shadow bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
					type="button"
				>
					Save
				</button>

				<button
					on:click|preventDefault={async () => await BlogStore.delPost(slug)}
					class="shadow bg-red-500 hover:bg-red-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
					type="button"
				>
					Delete
				</button>
			</div>
		</div>
	</form>
</section>


