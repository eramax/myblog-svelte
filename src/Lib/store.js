import { writable, get } from 'svelte/store';
import { httpGet } from './helpers.js';
import { commit } from './github.js';
import { encodeImage, encodeFile, generateSlug, generateId, getFileExtension } from './helpers.js';
import { githubConfig, API } from './config.js';

const blog = writable({ posts: [], cats: [] });
export const selectedPost = writable('');

export const LoadIndex = async (url) => {
	const data = await httpGet(url);
	blog.set(data);
};

export const LoadPost = async (url) => {
	return await httpGet(url);
};

export const BlogStore = {
	subscribe: blog.subscribe,
	savePost: async (post) => {
		console.log('save post');
		let files = [];
		console.table(post);
		if (!post.slug) post.slug = `${generateSlug(post.title)}${generateId(4)}`.toLowerCase();

		var container = document.createElement('div');
		container.innerHTML = post.content;

		let images = container.getElementsByTagName('img');
		for (let i = 0; i < images.length; i++) {
			// skip images already uploaded before (used when edit a post)
			if (images[i].src.includes(API)) continue;

			let newName = `${Date.now() / 1000}${generateId(5)}.${getFileExtension(images[i].src)}`;
			let newimage = {
				path: `${githubConfig.imagedir}${newName}`.toLowerCase(),
				data: await encodeImage(images[i].src)
			};
			images[i].src = `${API}${newimage.path}`;
			files.push(newimage);
		}
		post.content = container.innerHTML;

		let newpost = {
			path: `${githubConfig.postdir}${post.slug}.json`.toLowerCase(),
			data: await encodeFile(JSON.stringify(post))
		};

		files.push(newpost);

		// update the index file
		let postindexentry = [ post.slug, post.title, post.date, post.cats ];
		let items = get(BlogStore);
		items.posts = items.posts.filter((a) => a[0] !== post.slug);
		items.posts = [ postindexentry, ...items.posts ];
		items.posts.sort((a, b) => a[2] > b[2]);
		let indexdb = { cats: items.cats, posts: items.posts };

		let indexfile = {
			path: githubConfig.indexfile,
			data: await encodeFile(JSON.stringify(indexdb))
		};
		files.push(indexfile);

		console.log(files);
		await commit(files, `SAVE POST: ${post.title}`);
		blog.set(indexdb);
	},
	delPost: async (slug) => {
		if (!slug) return;
		console.log('delete post');

		let files = [];
		let items = get(BlogStore);
		let post = items.posts.filter((a) => a[0] === slug)[0];
		items.posts = items.posts.filter((a) => a[0] !== slug);
		items.posts.sort((a, b) => a[2] > b[2]);
		let indexdb = { cats: items.cats, posts: items.posts };

		let indexfile = {
			path: githubConfig.indexfile,
			data: await encodeFile(JSON.stringify(indexdb))
		};
		files.push(indexfile);
		console.log(files);
		await commit(files, `DELETE POST: ${post[1]}`);
		blog.set(indexdb);
	}
};
