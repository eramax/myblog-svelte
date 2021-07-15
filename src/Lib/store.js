import { writable, get } from 'svelte/store'
import { httpGet } from './helpers.js'
import { commit } from './github.js'
import {
  encodeImage,
  encodeFile,
  generateSlug,
  generateId,
  base64Extension,
  getBase64,
} from './helpers.js'

import { githubConfig, API } from './config.js'


const blog = writable({ posts: [], cats: [] })
export const selectedPost = writable('')
export const showMenu = writable(false)

export const LoadIndex = async (url) => {
  const data = await httpGet(url)
  blog.set(data)
}

export const LoadPost = async (url) => {
  return await httpGet(url)
}

export const BlogStore = {
  subscribe: blog.subscribe,
  addCategory: (catname) => {
    let items = get(BlogStore)
    let cats = items.cats
    let found = items.cats.filter((a) => a.name == catname)
    if (found.length > 0) return found[0].id
    let newIndex = 0
    let lastItem = items.cats[items.cats.length - 1]
    if (lastItem) newIndex = lastItem.id + 1
    cats = [...cats, { id: newIndex, name: catname }]
    let indexdb = { cats: cats, posts: items.posts }
    blog.set(indexdb)
    return newIndex
  },
  savePost: async (post) => {
    console.log('save post')
    let files = []
    console.table(post)
    if (!post.slug)
      post.slug = `${generateSlug(post.title)}_${generateId(4)}`.toLowerCase()

    var container = document.createElement('div')
    container.innerHTML = post.content

    let images = container.getElementsByTagName('img')
    let dt = new Date(post.date * 1000)

    for (let i = 0; i < images.length; i++) {
      // skip images already uploaded before (used when edit a post)
      if (images[i].src.includes(API)) continue

      let base64 = ''
      if (images[i].src.includes('base64')) base64 = images[i].src
      else base64 = await getBase64(images[i].src)

      let extension = base64Extension(base64)
      let encodebase64 = encodeImage(base64)

      let newName = `${post.date}${generateId(5)}.${extension}`
      let newimage = {
        path: `${
          githubConfig.imagedir
        }${dt.getFullYear()}/${dt.getMonth()}/${newName}`.toLowerCase(),
        data: encodebase64,
      }
      images[i].src = `${API}${newimage.path}`
      files.push(newimage)
    }
    post.content = container.innerHTML

    let newpost = {
      path: `${githubConfig.postdir}${post.slug}.json`.toLowerCase(),
      data: await encodeFile(JSON.stringify(post)),
    }

    files.push(newpost)

    // update the index file
    let postindexentry = [post.slug, post.title, post.date, post.cats]
    let items = get(BlogStore)
    items.posts = items.posts.filter((a) => a[0] !== post.slug)
    items.posts = [postindexentry, ...items.posts]
    items.posts.sort((a, b) => a[2] > b[2])
    let indexdb = { cats: items.cats, posts: items.posts }

    let indexfile = {
      path: githubConfig.indexfile,
      data: await encodeFile(JSON.stringify(indexdb)),
    }
    files.push(indexfile)

    console.log(files)
    await commit(files, `SAVE POST: ${post.title}`)
    blog.set(indexdb)
  },
  delPost: async (slug) => {
    if (!slug) return
    console.log('delete post')

    let files = []
    let items = get(BlogStore)
    let post = items.posts.filter((a) => a[0] === slug)[0]
    items.posts = items.posts.filter((a) => a[0] !== slug)
    items.posts.sort((a, b) => a[2] > b[2])
    let indexdb = { cats: items.cats, posts: items.posts }

    let indexfile = {
      path: githubConfig.indexfile,
      data: await encodeFile(JSON.stringify(indexdb)),
    }
    files.push(indexfile)
    console.log(files)
    await commit(files, `DELETE POST: ${post[1]}`)
    blog.set(indexdb)
  },
}
