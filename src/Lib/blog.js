import { commit } from './github.js';
import { encodeImage, encodeFile, generateSlug, generateId, getFileExtension } from './helpers.js';
import { githubConfig, API } from './config.js';

export const addPost = async (post, indexdb) => {
	console.log('add post');
	let files = [];

	let slug = `${generateSlug(post.title)}${generateId(4)}`;
	post.slug = slug;

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
	indexdb.posts = [ postindexentry, ...indexdb.posts ];
	let indexfile = {
		path: githubConfig.indexfile,
		data: await encodeFile(JSON.stringify(indexdb))
	};
	files.push(indexfile);

	console.log(files);
	await commit(files, `New post added: ${post.title}`);
	return indexdb.posts;
};

export const removePost = (url) => {
	console.log('remove post');
};

export const updatePost = (data) => {
	console.log('update post');
};
