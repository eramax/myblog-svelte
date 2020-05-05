<script>
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-routing";
  import Sidebar from "./Sidebar.svelte";
  import Post from "./Post.svelte";
  import Admin from "./Admin.svelte";
  import { httpGet } from "../Lib/helpers.js";

  let categories = [];
  let posts = [];
  let selectedPost = "";

  onMount(async function() {
    const data = await httpGet("/assets/index.json");
    categories = data.cats;
    posts = data.posts;
  });
</script>

<Router>
  <div class="w3-row w3-theme wapper">
    <Sidebar {categories} {posts} {selectedPost} />
    <main class="fullhight w3-col s12 m6 l7">
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
</Router>
