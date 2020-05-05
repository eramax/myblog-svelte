<script>
  import Jodit from "jodit";
  import { onMount } from "svelte";
  import { createCommit } from "../Lib/github.js";
  import { getFilename, getBlob, toDataURL } from "../Lib/helpers.js";
  let editor;
  let area;

  let access_token = localStorage.getItem("access_token");
  $: localStorage.setItem("access_token", access_token);

  const base64 = url => {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "blob";
    request.onload = function() {
      var reader = new FileReader();
      reader.readAsDataURL(request.response);
      reader.onload = function(e) {
        console.log("DataURL:", e.target.result);
      };
    };
    request.send();
  };

  async function submit() {
    let imagesfiles = [];
    let ht = editor.value;
    console.log(ht);
    var container = document.createElement("div");
    container.innerHTML = ht;
    let images = container.getElementsByTagName("img");
    for (let i = 0; i < images.length; i++) {
      let base64 = await toDataURL(images[i].src);
      base64 = base64.replace(/^data:image\/[a-z]+;base64,/, "");

      let newimage = {
        name: getFilename(images[i].src),
        data: base64
      };

      imagesfiles.push(newimage);
      images[i].src = `/assets/images/${newimage.name}`;
    }

    console.log(container.innerHTML);
    await createCommit(
      "filename.json",
      container.innerHTML,
      imagesfiles,
      "New post added"
    );
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
    <input class="w3-input w3-border w3-light-grey " type="text" />
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
