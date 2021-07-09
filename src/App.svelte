<script>
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-routing";
  import { API, githubConfig } from "./Lib/config.js";
  import { LoadIndex } from "./Lib/store.js";

  import Sidebar from "./layout/Sidebar.svelte";
  import Post from "./layout/Page.svelte";
  import Editor from "./Components/Editor.svelte";

  onMount(async function() {
    await LoadIndex(`${API}${githubConfig.indexfile}`);
  });
</script>


<Router>
  <div class="h-screen flex flex-row overflow-hidden">
    <div class="flex flex-col w-5/12">
      <Sidebar />
    </div>
    <main class="h-screen w-7/12">
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