<script>
  import Jodit from "jodit";
  import { onMount } from "svelte";
  import { addPost } from "../Lib/blog.js";

  let editor;
  let area;
  let title;

  let access_token = localStorage.getItem("access_token");
  $: localStorage.setItem("access_token", access_token);

  async function submit() {
    let post = {
      html: editor.value,
      title: title,
      slug: undefined
    };
    await addPost(post);
  }
  onMount(() => {
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
  });
</script>

<div class="w3-container w3-teal">
  <h2>New Post</h2>
</div>

<form class="w3-container w3-margin">
  <div class="w3-padding-16">
    <label class="w3-text-teal">
      <b>Post Titel</b>
    </label>
    <input
      bind:value={title}
      class="w3-input w3-border w3-light-grey "
      type="text" />
  </div>

  <textarea bind:this={area} />
  <div class="w3-padding-16">
    <label class="w3-text-teal">
      <b>Github access token</b>
    </label>
    <input
      class="w3-input w3-border w3-light-grey "
      bind:value={access_token}
      type="text" />
  </div>

  <button on:click|preventDefault={submit} class="w3-btn w3-blue-grey">
    Submit
  </button>
</form>
