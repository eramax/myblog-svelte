<script>
  import { link } from "svelte-routing";

  export let hideSidebar = false;
  export let categories = [];
  export let posts = [];
  export let selectedPost;
  let selectedCategory = 0;
  $: if (selectedPost) hideSidebar = true;
</script>

<button
  class="w3-button w3-hide-medium w3-hide-large w3-display-topright"
  on:click={() => (hideSidebar = !hideSidebar)}>
  <img src="./assets/icons/menu.webp" alt="sidebar" />
</button>

<nav class={'w3-col s12 m6 l5 ' + (hideSidebar ? 'w3-hide-small' : '')}>
  <section class="fullhight navlist catList w3-col s4 m5 l4 ">
    <img
      class="w3-col w3-circle"
      alt="Ahmed Essam"
      src="./assets/icons/me2.webp" />
    <a use:link href="/admin">
      <h4 class="brand ">AHMED ESSAM</h4>
    </a>

    <div class="w3-row ">
      {#each categories as cat}
        <article
          class={'w3-col w3-button w3-left-align w3-bar-item  ' + (selectedCategory == cat.id ? 'w3-deep-orange' : '')}
          on:click={() => (selectedCategory = cat.id)}>
          {cat.name}
        </article>
      {/each}
    </div>
  </section>

  <section class="fullhight navlist postList w3-col s8 m7 l8 ">
    {#each posts as post}
      {#if post[3].includes(selectedCategory)}
        <a
          use:link
          href={'/' + post[0]}
          class={'w3-border-bottom w3-padding-small ' + (selectedPost == post[0] ? 'w3-blue-grey' : '')}>

          <img
            class="w3-col"
            src="/assets/icons/post.png"
            alt="post"
            style="width:40px; padding-right:5px" />

          <div class="w3-rest">
            <b class="w3-row">{post[1]}</b>

            <small>{new Date(post[2] * 1000).toDateString()}</small>
          </div>
        </a>
      {/if}
    {/each}
  </section>
</nav>
