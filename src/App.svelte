<script>
  import { Route, Router } from "svelte-routing";
  import CatList from "./CatList.svelte";
  import PostList from "./PostList.svelte";
  import Post from "./Post.svelte";
  import Admin from "./Admin.svelte";
  import { onMount } from "svelte";
  import { httpGet } from "./helpers.js";

  let hideSidebar = false;
  let categories = [];
  let posts = [];
  let selectedCategory = 0;
  let selectedPost = "";
  $: if (selectedPost) hideSidebar = true;
  onMount(async function() {
    const data = await httpGet("/assets/index.json");
    categories = data.cats;
    posts = data.posts;
  });
</script>

<Router>
  <div class="w3-row w3-theme wapper">
    <button
      class="w3-button w3-hide-medium w3-hide-large w3-display-topright"
      on:click={() => (hideSidebar = !hideSidebar)}>
      <img src="./assets/icons/menu.webp" alt="sidebar" />
    </button>

    <div class={'w3-col s12 m6 l5 ' + (hideSidebar ? 'w3-hide-small' : '')}>
      <CatList
        {categories}
        {selectedCategory}
        select={id => (selectedCategory = id)} />
      <PostList {posts} {selectedPost} {selectedCategory} />
    </div>
    <div class="w3-col s12 m6 l7">
      <main class="fullhight">
        <Route path="/admin">
          <Admin />
        </Route>
        <Route path="/">
          <Post slug="/" updateMe={x => console.log()} />
        </Route>
        <Route path="/:slug" let:params>
          <Post slug={params.slug} updateMe={x => (selectedPost = x)} />
        </Route>
      </main>
    </div>
  </div>
</Router>
