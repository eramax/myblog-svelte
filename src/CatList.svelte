<script>
  export let categories = [];
  export let select;
  export let selectedCategory;
</script>

<nav class="fullhight navlist catList w3-col s4 m5 l4 ">
  <img
    class="w3-col w3-circle"
    alt="Ahmed Essam"
    src="./assets/icons/me2.webp" />
  <a href="/admin">
    <h4 class="brand ">AHMED ESSAM</h4>
  </a>

  <div class="w3-row ">
    {#each categories as cat}
      <article
        class={'w3-col w3-button w3-left-align w3-bar-item  ' + (selectedCategory == cat.id ? 'w3-deep-orange' : '')}
        on:click={() => select(cat.id)}>
        {cat.name}
      </article>
    {/each}
  </div>
</nav>
