export const githubConfig = {
	user: 'eramax',
	repoName: 'myBlogStorage',
	branch: 'master',
	imagedir: 'public/uploads/',
	postdir: 'public/posts/',
	indexfile: 'public/index.json'
};
export const API = `https://raw.githubusercontent.com/${githubConfig.user}/${githubConfig.repoName}/${githubConfig.branch}/`;
