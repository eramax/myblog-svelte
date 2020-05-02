<script>
  import { onMount } from "svelte";
  import { httpGet } from "./db.js";

  export let slug;
  let promise;
  $: if (slug) promise = httpGet("assets/posts/" + slug + ".json");
</script>

{#await promise then post}
  <article class=" w3-container">
    <header class="w3-border-bottom">
      <h1>
        <b>{post.title}</b>
      </h1>
      <span>{new Date(post.date * 1000).toDateString()}</span>
    </header>
    <section class="w3-content">
      {@html post.content}
    </section>

  </article>
{/await}
