export const githubConfig = {
	user: 'eramax',
	repoName: 'test10',
	branch: 'master',
	imagedir: 'public/assets/images/',
	postdir: 'public/assets/posts/',
	indexfile: 'public/assets/index.json'
};
export const API = `https://raw.githubusercontent.com/${githubConfig.user}/${githubConfig.repoName}/${githubConfig.branch}/`;
