<script>
  import { Route, Router } from "svelte-routing";
  import CatList from "./CatList.svelte";
  import PostList from "./PostList.svelte";
  import Post from "./Post.svelte";
  import { onMount, afterUpdate } from "svelte";
  import { httpGet } from "./db.js";

  let hideSidebar = false;
  let categories = [];
  let posts = [];
  let url = "";

  onMount(async function() {
    const data = await httpGet("/assets/index.json");
    categories = ["Home", ...data.cats];
    posts = data.posts;
  });
</script>

<Router {url}>
  <div class="w3-row w3-theme wapper">
    <button
      class="w3-button w3-hide-medium w3-hide-large w3-display-topright"
      on:click={() => (hideSidebar = !hideSidebar)}>
      <img src="./assets/icons/menu.webp" alt="sidebar" />
    </button>

    <div class={'w3-col s12 m6 l5 ' + (hideSidebar ? 'w3-hide-small' : '')}>
      <CatList {categories} />
      <PostList {url} {posts} />
    </div>
    <div class="w3-green w3-col s12 m6 l7">
      <main>
        <Route path="/">
          <Post slug="/" />
        </Route>
        <Route path="/:slug" let:params>
          <Post slug={params.slug} />
        </Route>
      </main>
    </div>
  </div>
</Router>
