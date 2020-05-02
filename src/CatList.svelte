<script>
  export let categories = [];
</script>

<nav class="fullhight navlist catList w3-col s4 m5 l4">
  <img
    class="w3-col w3-circle"
    alt="Ahmed Essam"
    src="./assets/icons/me2.webp" />
  <h4 class="brand ">AHMED ESSAM</h4>
  <div class="w3-row ">
    {#each categories as cat}
      <a
        class="w3-col w3-button w3-left-align "
        on:click={() => console.log(cat)}>
        {cat}
      </a>
    {/each}
  </div>
</nav>
