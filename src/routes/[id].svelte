<script context="module">
    import { githubConfig, API } from "../Lib/config.js";
    import { LoadPost, selectedPost, showMenu } from "../Lib/store.js";
    export async function load(ctx) {
        let slug = ctx.page.params.id;
        selectedPost.set(slug);
        showMenu.set(false);
        let promise = LoadPost(`${API}${githubConfig.postdir}${slug}.json`);
        return { props: { promise }}
    }
</script>
<script>
    import { fly } from "svelte/transition";
    import '../global.css'

    export let promise;

</script>

<svelte:head>
	<title>Eramax blog</title>
</svelte:head>

{#if promise}
{#await promise then post}
  <article class="w-full" in:fly={{ x: 100, y: 0 }}>
    <header class="border-b-2 border-yellow-500 p-4">
      <div class="capitalize text-3xl font-bold mb-2 ">
        {post.title}
      </div>
      <span>{new Date(post.date * 1000).toDateString()}</span>
      <a href={`/editor/${post.slug}`}>Edit</a>
    </header>
    <section class="py-4 px-8 text-lg sm:text-lg font-medium sm:leading-10 space-y-6 mb-16">
      {@html post.content}
    </section>
  </article>
{/await}
{/if}
