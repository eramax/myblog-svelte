<script>
  import { onMount } from "svelte";
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
    <article class=" w3-container" in:fly={{ x: -200, y: 0 }}>
      <header class="w3-border-bottom">
        <h2>
          <b>{post.title}</b>
        </h2>
        <span>{new Date(post.date * 1000).toDateString()}</span>
        <a use:link href={`/editor/${post.slug}`}>Edit</a>
      </header>
      <section class="w3-main w3-padding-16">
        {@html post.content}
      </section>
    </article>
  {/await}
{/if}
