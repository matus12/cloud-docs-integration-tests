import Octokit from "@octokit/rest";

require("dotenv").config();

const GithubApiToken = process.env.GITHUB_API_TOKEN || '';
const GithubRepo = process.env.GITHUB_REPOSITORY || '';
const GithubRepoOwner = process.env.GITHUB_REPOSITORY_OWNER || '';
const GithubRef = "heads/master";

interface CommitFile {
    path: string;
    content: string;
}

export let blobs: any = [];
let gitHub: Octokit;

const getReferenceCommit = async (github: Octokit): Promise<string> => {
    const res = await github.git.getRef({
        owner: GithubRepoOwner,
        repo: GithubRepo,
        ref: GithubRef,
    });

    return res.data.object.sha;
};

const createTree = async (github: Octokit, files: CommitFile[], referenceCommitSha: string): Promise<string> => {
    const commitBlobs = [];

    for (const file of files) {
        const blob = await github.git.createBlob({
            owner: GithubRepoOwner,
            repo: GithubRepo,
            content: file.content,
            encoding: "utf-8",
        });

        commitBlobs.push({
            sha: blob.data.sha,
            path: file.path,
            mode: "100644",
            type: "blob",
        });
    }

    // @ts-ignore
    const res = await github.git.createTree({
        owner: GithubRepoOwner,
        repo: GithubRepo,
        tree: commitBlobs,
        base_tree: referenceCommitSha,
    });

    blobs.push(...commitBlobs);

    return res.data.sha;
};

const createCommit = async (github: Octokit, referenceCommitSha: string, newTreeSha: string): Promise<string> => {
    const res = await github.git.createCommit({
        owner: GithubRepoOwner,
        repo: GithubRepo,
        message: "Test commit",
        tree: newTreeSha,
        parents: [referenceCommitSha],
    });

    return res.data.sha;
};

const updateReference = async (github: Octokit, newCommitSha: string): Promise<void> => {
    await github.git.updateRef({
        owner: GithubRepoOwner,
        repo: GithubRepo,
        ref: GithubRef,
        sha: newCommitSha,
    });
};

export const gitCommitPush = async (files: CommitFile[]): Promise<void> => {
    gitHub = new Octokit({
        auth: "token " + GithubApiToken,
    });

    const referenceCommitSha = await getReferenceCommit(gitHub);
    const newTreeSha = await createTree(gitHub, files, referenceCommitSha);
    const newCommitSha = await createCommit(gitHub, referenceCommitSha, newTreeSha);

    await updateReference(gitHub, newCommitSha);
};

export const deleteFilesFromGitHub = async (): Promise<void> => {
    try {
        for (const blob of blobs) {
            await gitHub.repos.deleteFile({
                owner: GithubRepoOwner,
                repo: GithubRepo,
                path: blob.path,
                message: 'Project cleanup',
                sha: blob.sha,
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};
