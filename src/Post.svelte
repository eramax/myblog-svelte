<script>
  import { onMount } from "svelte";
  import { httpGet } from "./helpers.js";

  export let slug;
  export let updateMe;
  let promise = undefined;
  $: {
    if (slug && slug != "/") {
      updateMe(slug);
      promise = httpGet("assets/posts/" + slug + ".json");
    }
  }
</script>

{#if !promise}
  <h3>Please select a post</h3>
{:else}
  {#await promise then post}
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
  {/await}
{/if}
