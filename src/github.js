import { GithubConfig } from './config.js';
import Octokat from 'octokat';

export const createCommit = async(filename, data, images, commitMessage) => {
    try {
        let token = localStorage.getItem('access_token');
        if (!token) return;
        const github = new Octokat({ token: token });
        const filepath = `public/assets/${filename}`.toLowerCase();
        let repo = await github.repos(GithubConfig.user, GithubConfig.repoName).fetch();
        let main = await repo.git.refs('heads/master').fetch();
        let treeItems = [];
        for (let image of images) {
            let imageGit = await repo.git.blobs.create({ content: image.data, encoding: 'base64' });
            let imagePath = `public/assets/images/${image.name}`.toLowerCase();
            treeItems.push({
                path: imagePath,
                sha: imageGit.sha,
                mode: '100644',
                type: 'blob'
            });
        }

        let file = await repo.git.blobs.create({ content: btoa(jsonEncode(data)), encoding: 'base64' });
        treeItems.push({
            path: filepath,
            sha: file.sha,
            mode: '100644',
            type: 'blob'
        });

        console.log('treeItems', treeItems);
        let tree = await repo.git.trees.create({
            tree: treeItems,
            base_tree: main.object.sha
        });

        let commit = await repo.git.commits.create({
            message: `Created via Web - ${commitMessage}`,
            tree: tree.sha,
            parents: [main.object.sha]
        });

        main.update({ sha: commit.sha });
        console.log('Posted');
    } catch (err) {
        console.error(err);
        console.log(err);
    }
};

const jsonEncode = (str) => {
    str = str.replace(/[^\x00-\x7F]/g, function(char) {
        var hex = char.charCodeAt(0).toString(16);
        while (hex.length < 4) hex = '0' + hex;

        return '\\u' + hex;
    });

    return str;
};