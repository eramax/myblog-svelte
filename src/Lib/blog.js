import { commit } from './github.js';
import { getFilename, encodeImage, encodeFile, generateSlug } from './helpers.js';
import { githubConfig } from './config.js';

export const addPost = async (post, indexdb) => {
	console.log('add post');
	let files = [];

	let uq = 0;
	let slug = generateSlug(post.title);
	while (slug in indexdb.posts) {
		slug = `${slug}${++uq}`;
	}

	post.slug = slug;

	var container = document.createElement('div');
	container.innerHTML = post.content;

	let images = container.getElementsByTagName('img');

	for (let i = 0; i < images.length; i++) {
		let newimage = {
			path: `${githubConfig.imagedir}${getFilename(images[i].src)}`.toLowerCase(),
			data: await encodeImage(images[i].src)
		};
		images[i].src = newimage.path;
		files.push(newimage);
	}
	post.content = container.innerHTML;

	let newpost = {
		path: `${githubConfig.postdir}${post.slug}.json`.toLowerCase(),
		data: await encodeFile(JSON.stringify(post))
	};

	files.push(newpost);

	// update the index file
	let postindexentry = [ post.slug, post.title, post.data, post.cats ];
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
