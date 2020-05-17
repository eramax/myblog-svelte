<script>
  import Jodit from "jodit";
  import { onMount } from "svelte";
  import { BlogStore } from "../Lib/store.js";
  import { githubConfig, API } from "../Lib/config.js";
  import { LoadPost, selectedPost } from "../Lib/store.js";

  export let slug = undefined;
  let post = undefined;
  let access_token = localStorage.getItem("access_token");
  $: localStorage.setItem("access_token", access_token);

  let editor;
  let area;
  let title;
  let cats = [0];

  async function save() {
    post = {
      date: (post && post.date) || Math.floor(Date.now() / 1000),
      cats: cats || [0],
      content: editor.value,
      title: title,
      slug: (post && post.slug) || undefined
    };
    await BlogStore.savePost(post);
  }

  onMount(async () => {
    editor = Jodit.make(area, {
      askBeforePasteHTML: false,
      processPasteHTML: true,
      removeEmptyBlocks: false,
      defaultActionOnPaste: "insert_clear_html",
      height: "60vh",
      uploader: {
        insertImageAsBase64URI: true
      },
      events: {
        change: function(n) {}
      }
    });
    if (slug) {
      post = await LoadPost(`${API}${githubConfig.postdir}${slug}.json`);
      if (post) {
        editor.value = post.content;
        title = post.title;
        cats = post.cats;
      }
    }
  });
</script>

<section>
  <div class="w3-container w3-teal">
    <h2>Post Editor</h2>
  </div>

  <form class="w3-container">
    <div class="w3-row w3-padding-16">
      <label class="w3-text-teal">
        <b>Post title</b>
      </label>
      <input
        class="w3-input w3-border w3-light-grey"
        type="text"
        bind:value={title} />
    </div>
    <textarea bind:this={area} />

    <div class="w3-row w3-card w3-padding-16 ">
      <header class="w3-container w3-light-grey">
        <h3>Tags</h3>
      </header>
      {#each $BlogStore.cats as cat}
        <div class="w3-col m4 ">
          <input
            class="w3-check"
            type="checkbox"
            bind:group={cats}
            value={cat.id} />
          <label>{cat.name}</label>
        </div>
      {/each}
    </div>

    <div class="w3-row w3-padding-16">
      <label class="w3-text-teal">
        <b>Github access token</b>
      </label>
      <input
        class="w3-input w3-border w3-light-grey "
        bind:value={access_token}
        type="text" />
    </div>

    <button on:click|preventDefault={save} class="w3-btn w3-blue-grey">
      Save
    </button>
    <button
      on:click|preventDefault={async () => await BlogStore.delPost(slug)}
      class="w3-btn w3-red">
      Delete
    </button>
  </form>
</section>
