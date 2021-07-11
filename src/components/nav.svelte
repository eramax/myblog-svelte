<script>
    import { BlogStore, selectedPost } from "../Lib/store"
  
    export let hideSidebar = false;
    let selectedCategory = 0;
    $: if ($selectedPost) hideSidebar = true;
  
    let mode = "blog"
    let mods = [{name: "blog", icon:"assets/blog.png"}, {name: "rss", icon:"assets/rss.png"}]

    const loadLive = () => {}
    let catlist;
  
    const getDateFormated = x => {
      let month = new Intl.DateTimeFormat('en-US', { month: 'short'}).format(x);
      return `${x.getDate()} ${month}`
    }

    const resetlist = (_) => {
      catlist?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    $: resetlist(selectedCategory);

  </script>
  
  
  <div class="flex flex-row overflow-hidden w-full select-none  border-gray-800 h-screen">
    <ul class="h-full bg-gray-700 w-8">
      {#each mods as md}
      <li on:click={loadLive} class="hover:bg-gray-400">
        <img
          src={md.icon}
          class={`text-white font-bold p-2 rounded mb-2  ${mode == md.name ? 'bg-gray-500' : ''} `}
          alt="" />
      </li>
      {/each}
    </ul>
  
    <div class="h-full capitalize bg-gray-800 text-gray-300 flex flex-col overflow-y-scroll w-4/12 	">
      <img class="rounded-full m-2 "  alt="Ahmed Morsi" src="/assets/icons/me2.webp" />
      <a href="/editor">
        <h6 class="font-bold text-center mb-2 ">AHMED MORSI</h6>
      </a>
      <ul class="w-full mb-2">
        {#each $BlogStore.cats as cat}
            <li class={`block py-2 hover:bg-gray-600 align-middle pl-3 
              ${selectedCategory == cat.id ? 'bg-gray-500' : ''} `}
              on:click={() => (selectedCategory = cat.id)}>
              <div class="flex">
                <span class="w-auto pl-2 font-semibold truncate">{cat.name}</span>
              </div>
            </li>
          {/each}
      </ul>
    </div>
  
    <div class="flex flex-wrap flex-col h-full overflow-y-scroll overflow-x-hidden bg-white text-black w-8/12">
      <ul bind:this={catlist} class="w-full pb-8 ">
        {#each $BlogStore.posts.filter(p => p[3].includes(selectedCategory)) as post (post)}
        <li class="w-full rounded overflow-hidden border shadow  px-1 mt-2 bg-gray-200">
          <a href={'/' + post[0]}>
          <div class=" rounded-b p-1 flex flex-row ">
            <div class="w-2/12 h-10 bg-white text-sm  overflow-hidden ">
              <div class="w-full text-center  ">
                <div class="text-center ">
                  <div class="bg-yellow-400 text-white">
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
        </a>
        </li>
        {/each}
      </ul>
    </div>
  </div>
  
  
  