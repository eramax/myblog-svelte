<script>
  import { githubConfig, API } from "../Lib/config.js";
  import { LoadPost, selectedPost } from "../Lib/store.js";
  import { fly } from "svelte/transition";
  import { link } from "svelte-routing";

  export let slug;
  let promise = undefined;
  $: load(slug);

  const load = url => {
    selectedPost.set(slug);
    promise = LoadPost(`${API}${githubConfig.postdir}${slug}.json`);
  };
</script>

{#if promise}
  {#await promise then post}
    <article class=" flex-1 flex bg-gray-300 overflow-hidden" in:fly={{ x: -200, y: 0 }}>
      <header class="w-full h-full bg-black">
        <h2>
          <b>{post.title}</b>
        </h2>
        <span>{new Date(post.date * 1000).toDateString()}</span>
        <a use:link href={`/editor/${post.slug}`}>Edit</a>
      </header>
      <section class="w-full h-full bg-black p-16">
        {@html post.content}
      </section>
    </article>
  {/await}
{/if}

<!-- {#if playing === 'error'}
  <div class="absolute top-0 right-0 mt-3 w-64">
    <div
      class="bg-red-100 border-t-4 border-red-500 rounded-b text-red-900 px-4
        py-3 shadow-md"
      role="alert">
      <div class="flex">
        <div class="py-1">
          <svg
            class="fill-current h-6 w-6 text-teal-500 mr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"><path
              d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg>
        </div>
        <div>
          <p class="font-bold">{selectedChannel.name}</p>
          <p class="text-sm">Not working.</p>
        </div>
      </div>
    </div>
  </div>
{/if} -->
