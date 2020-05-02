<script>
  import { link } from "svelte-routing";

  export let posts = [];
  export let url = "";
</script>

<nav class="fullhight navlist postList w3-col s8 m7 l8 ">
  {#each posts as post}
    <a
      use:link
      href={'/' + post[0]}
      class={'w3-border-bottom w3-padding-small ' + (url == '/' + post[0] ? 'w3-blue-grey' : '')}>

      <img
        class="w3-col"
        src="/assets/icons/post.png"
        alt="post"
        style="width:40px; padding-right:5px" />

      <div class="w3-rest">
        <b class="w3-row">{post[1][0]}</b>

        <small>{new Date(post[1][1] * 1000).toDateString()}</small>
      </div>
    </a>
  {/each}
</nav>
