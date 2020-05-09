<script>
  import { onMount } from "svelte";
  import { httpGet } from "../Lib/helpers.js";
  import { githubConfig, API } from "../Lib/config.js";
  import { LoadPost, selectedPost } from "../Lib/store.js";

  export let slug;
  let promise = undefined;
  $: load(slug);

  const load = url => {
    selectedPost.set(slug);
    promise = LoadPost(`${API}${githubConfig.postdir}${slug}.json`);
  };
</script>

{#if promise}
  {#await promise}
    <h3>Loading...</h3>
  {:then post}
    <article class=" w3-container">
      <header class="w3-border-bottom">
        <h2>
          <b>{post.title}</b>
        </h2>
        <span>{new Date(post.date * 1000).toDateString()}</span>
      </header>
      <section class="w3-content">
        {@html post.content}
      </section>
    </article>
  {:catch error}
    <h3>Error</h3>
  {/await}
{/if}
