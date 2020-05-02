<script>
  import { onMount } from "svelte";
  import { httpGet } from "./db.js";

  export let slug;
  let promise;
  $: if (slug) promise = httpGet("assets/posts/" + slug + ".json");
</script>

{#await promise then post}
  <h1>{post.title}</h1>
  <h1>{slug}</h1>
{/await}
