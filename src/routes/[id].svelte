<script context="module">
  import { githubConfig, API } from "$lib/config.js";
  import { LoadPost, selectedPost, showMenu } from "$lib/store.js";
  export async function load({ params }) {
    let slug = params.id;
    selectedPost.set(slug);
    showMenu.set(false);
    let post = await LoadPost(`${API}${githubConfig.postdir}${slug}.json`);
    return { props: { post } };
  }
</script>

<script>
  import { fly } from "svelte/transition";
  import { afterUpdate } from "svelte";

  export let post;
  let art;

  afterUpdate(() => {
    art.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
</script>

<svelte:head>
  <title>{post.title}</title>
</svelte:head>

<article bind:this={art} class="w-full" in:fly={{ x: 100, y: 0 }}>
  <header class="border-b-2 border-yellow-500 p-4">
    <h1 class="capitalize text-3xl font-bold mb-2 ">
      {post.title}
    </h1>
    <span>{new Date(post.date * 1000).toDateString()}</span>
    <a href={`/editor/${post.slug}`}>Edit</a>
  </header>
  <section
    class="py-4 px-8 text-lg sm:text-lg font-medium sm:leading-10 space-y-6 mb-16"
  >
    {@html post.content}
  </section>
</article>
