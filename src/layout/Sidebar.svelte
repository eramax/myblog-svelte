<script>
  import { link } from "svelte-routing";
  import { BlogStore, selectedPost } from "../Lib/store.js";

  export let hideSidebar = false;
  let selectedCategory = 0;
  $: if ($selectedPost) hideSidebar = true;

  let mode = "live"
  const loadLive = () => {}

  const getDateFormated = x => {
    var options = { month: 'short'};
    var month = new Intl.DateTimeFormat('en-US', options).format(x);
    return `${x.getDate()} ${month}`
  }
</script>


<div class="flex flex-row overflow-hidden w-full select-none  border-gray-800 h-screen">
  <ul class="h-full bg-gray-700 w-1/12">
    <li on:click={loadLive}>
      <img
        src="assets/tv.png"
        class={`text-white font-bold p-2 rounded mb-2  ${mode == 'live' ? 'bg-orange-700' : 'hover:bg-gray-500'} `}
        alt="" />
    </li>
    <li on:click={loadLive}>
      <img
        src="assets/movies.png"
        class={`text-white font-bold p-2 rounded mb-2  ${mode == 'vod' ? 'bg-orange-700' : 'hover:bg-gray-500'} `}
        alt="" />
    </li>
  </ul>

  <div class="h-full capitalize bg-gray-800 text-gray-300 flex flex-col overflow-y-scroll w-4/12	">
    <img class="rounded-full m-2 "  alt="Ahmed Essam" src="/assets/icons/me2.webp" />
    <ul class="">
      {#each $BlogStore.cats as cat}
          <li class={`block py-2 pl-1 hover:bg-gray-600 align-middle pl-3 
            ${selectedCategory == cat.id ? 'bg-gray-500' : ''} `}
            on:click={() => (selectedCategory = cat.id)}>
            <div class="flex">
              <img src="assets/channel.png" loading="lazy"  alt="" class="w-6 h-6" />
              <span
                class="w-auto pl-4 font-semibold truncate">{cat.name}</span>
            </div>
          </li>
        {/each}
    </ul>
  </div>

  <div class="flex flex-wrap flex-col h-full overflow-y-scroll bg-white text-black w-7/12">
    <ul>
      {#each $BlogStore.posts.filter(p => p[3].includes(selectedCategory)) as post (post)}
      <li class="w-full rounded overflow-hidden border shadow  px-1 mt-2 bg-gray-200">
        <div class=" rounded-b p-1 flex flex-row ">
          <div class="w-2/12 h-12 bg-white font-bold  overflow-hidden ">
            <div class="w-full text-center  ">
              <div class="text-center ">
                <div class="bg-yellow-500 text-white">
                  {new Date(post[2] * 1000).getFullYear()}
                </div>
                <div class="">
                  <span class="text-sm leading-tight  ">
                    {getDateFormated(new Date(post[2] * 1000))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="w-10/12 ml-2 font-bold text-base mb-1 leading-tight ">{post[1]}</div>
        </div>
      </li>
      {/each}
    </ul>
  </div>
</div>


