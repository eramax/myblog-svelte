<script context="module">
    export async function load(ctx) {
        let slug = ctx.page.params.id;
        return { props: { slug }}
    }
</script>



<div class="p-8" id="editor"></div>

<script>
	import { onMount } from 'svelte';
	import { BlogStore } from '../Lib/store.js';
	//import {Editor} from '@toast-ui/editor';
	import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's Style
  let markdown ;

  let con1 = "<h1>Hello</h1>";


  let con2 = "## h2 Heading";

  const Editor = toastui.Editor;
  onMount(async () => {
    //let Editor = await import('@toast-ui/editor');
    console.log(document.querySelector("#editor").innerHTML )
    const editor = new Editor({
      el:  document.querySelector("#editor"),
      height: "500px",
      initialEditType: "markdown",
      initialValue: con1,
      previewStyle: "vertical"
    });
    window.ed = editor;
    editor.getMarkdown();
  });
</script>
