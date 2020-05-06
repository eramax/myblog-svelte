<script>
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-routing";
  import { httpGet } from "../Lib/helpers.js";
  import { addPost } from "../Lib/blog.js";
  import { API, githubConfig } from "../Lib/config.js";
  import Sidebar from "./Sidebar.svelte";
  import Post from "./Post.svelte";
  import Admin from "./Admin.svelte";

  let categories = [];
  let posts = [];
  let selectedPost = "";

  onMount(async function() {
    const data = await httpGet(`${API}${githubConfig.indexfile}`);
    categories = data.cats;
    posts = data.posts;
  });

  const submitPost = async post => {
    let tmp = { cats: categories, posts: posts };
    posts = await addPost(post, tmp);
  };
</script>

<Router>
  <div class="w3-row w3-theme wapper">
    <Sidebar {categories} {posts} {selectedPost} />
    <main class="fullhight w3-col s12 m6 l8">
      <Route path="/admin">
        <Admin {submitPost} />
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
