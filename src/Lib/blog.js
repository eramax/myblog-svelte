import { commit } from './github.js';
import { getFilename, encodeImage, encodeFile } from './helpers.js';
import { githubConfig } from './config.js';

export const addPost = async (post) => {
	console.log('add post');
	let files = [];
	if (!post.slug) post.slug = 'ahmed';

	var container = document.createElement('div');
	container.innerHTML = post.html;

	let images = container.getElementsByTagName('img');

	for (let i = 0; i < images.length; i++) {
		let newimage = {
			path: `${githubConfig.imagedir}${getFilename(images[i].src)}`.toLowerCase(),
			data: await encodeImage(images[i].src)
		};
		images[i].src = newimage.path;
		files.push(newimage);
	}

	let newpost = {
		path: `${githubConfig.postdir}${post.slug}.json`.toLowerCase(),
		data: await encodeFile(container.innerHTML)
	};

	files.push(newpost);

	console.log(files);
	await commit(files, `New post added: ${post.title}`);
};

export const removePost = (url) => {
	console.log('remove post');
};

export const updatePost = (data) => {
	console.log('update post');
};
