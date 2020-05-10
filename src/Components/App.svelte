<script>
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-routing";
  import { API, githubConfig } from "../Lib/config.js";
  import { LoadIndex } from "../Lib/store.js";

  import Sidebar from "./Sidebar.svelte";
  import Post from "./Post.svelte";
  import Editor from "./Editor.svelte";

  onMount(async function() {
    await LoadIndex(`${API}${githubConfig.indexfile}`);
  });
</script>

<Router>
  <div class="w3-row w3-theme wapper">
    <Sidebar />
    <main class="fullhight w3-col s12 m6 l8">
      <Route path="/editor" let:params>
        <Editor />
      </Route>
      <Route path="/editor/:slug" let:params>
        <Editor slug={params.slug} />
      </Route>
      <Route path="/">
        <h3>Please select a post</h3>
      </Route>
      <Route path="/:slug" let:params>
        <Post slug={params.slug} />
      </Route>
    </main>
  </div>
</Router>
