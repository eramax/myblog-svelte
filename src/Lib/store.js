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
	addPost: async (post) => {
		console.log('add post');
		let files = [];
		if (!post.slug) post.slug = `${generateSlug(post.title)}${generateId(4)}`.toLowerCase();

		var container = document.createElement('div');
		container.innerHTML = post.content;

		let images = container.getElementsByTagName('img');
		for (let i = 0; i < images.length; i++) {
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
		let indexdb = { cats: items.cats, posts: [ postindexentry, ...items.posts ] };
		let indexfile = {
			path: githubConfig.indexfile,
			data: await encodeFile(JSON.stringify(indexdb))
		};
		files.push(indexfile);

		console.log(files);
		console.log('new', indexdb);
		await commit(files, `New post added: ${post.title}`);
		blog.set(indexdb);
	},
	updatePost: (slug, updatedpost) => {
		blog.update((items) => {
			const current = [ ...items ];
			const idx = current.findIndex((i) => i.slug === slug);
			current[idx] = updatedpost;
			return current;
		});
	},
	removeMeetup: (slug) => {
		blog.update((items) => {
			return items.filter((i) => i.slug !== slug);
		});
	}
};
