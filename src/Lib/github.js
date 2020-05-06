import { githubConfig } from './config.js';
import Octokat from 'octokat';

export const commit = async (files, commitMessage) => {
	try {
		let token = localStorage.getItem('access_token');
		if (!token) return;
		const github = new Octokat({ token: token });
		let repo = await github.repos(githubConfig.user, githubConfig.repoName).fetch();
		let main = await repo.git.refs('heads/master').fetch();
		let treeItems = [];
		for (let x of files) {
			console.log(x);
			let file = await repo.git.blobs.create({ content: x.data, encoding: 'base64' });
			treeItems.push({
				path: x.path,
				sha: file.sha,
				mode: '100644',
				type: 'blob'
			});
		}

		console.log('treeItems', treeItems);
		let tree = await repo.git.trees.create({
			tree: treeItems,
			base_tree: main.object.sha
		});

		let commit = await repo.git.commits.create({
			message: commitMessage,
			tree: tree.sha,
			parents: [ main.object.sha ]
		});

		main.update({ sha: commit.sha });
		console.log('Posted');
		alert('Posted');
	} catch (err) {
		console.error(err);
	}
};
