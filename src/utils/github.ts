import {graphql as octoql} from '@octokit/graphql';

export interface Ref {
	id: string,
	name: string,
	target: {
		oid: string
	}
	repository: {
		id: string,
		name: string,
		owner: {
			login: string
		}
	}
}

export interface Message {
	headline: string,
	body: string
}

export interface FileChanges {
	additions: [{
		path: string,
		contents: string
	}],
	deletions: [{
		path: string
	}]
}

export interface Commit {
	oid: string
}

export interface PullRequest {
	id: string,
	url: string
}

export function makeCompareUrl(branch: Ref) {
	return `https://github.com/${branch.repository.owner.login}/${branch.repository.name}/compare/${branch.name}?expand=1`;
}

export async function getRef(
	bearer: string, 
	owner: string, 
	repo: string, 
	path: string
) : Promise<Ref> {
	const gql = `
	query ref($owner: String!, $repo: String!, $path: String!) {
		repository(owner: $owner, name: $repo) {
			ref(qualifiedName: $path) {
				id
				name,
				target {
					oid
				},
				repository {
					id,
					name,
					owner {
						login
					}
				}
			}
		}
	}`;

	const {repository} = await octoql<{repository: {ref: Ref}}>(gql, {
		owner, repo, path,
		headers: {
			authorization: `token ${bearer}`
		}
	});

	return repository.ref;
}

export async function createRef(
	bearer: string, 
	base: Ref, 
	name: string
) : Promise<Ref> {
	const gql = `
	mutation($input: CreateRefInput!) {
		createRef(input: $input) {
			ref {
				id
				name,
				target {
					oid
				},
				repository {
					id,
					name,
					owner {
						login
					}
				}
			}
		}
	}`;

	const result = await octoql<{createRef: {ref: Ref}}>(gql, {
		input: {
			name: `refs/heads/${name}`,
			oid: base.target.oid,
			repositoryId: base.repository.id
		},
		headers: {
			authorization: `token ${bearer}`
		}
	});

	return result.createRef.ref;
}

export async function createCommitOnBranch(
	bearer: string,
	branch: Ref,
	message: Message,
	fileChanges: FileChanges
) : Promise<Commit> {
	const gql = `
	mutation($input: CreateCommitOnBranchInput!) {
		createCommitOnBranch(input: $input) {
			commit {
				oid
			}
		}
	}`;

	const result = await octoql<{createCommitOnBranch: {commit: Commit}}>(gql, {
		input: {
			branch: {
				id: branch.id
			},
			expectedHeadOid: branch.target.oid,
			fileChanges,
			message
		},
		headers: {
			authorization: `token ${bearer}`
		}
	});

	return result.createCommitOnBranch.commit;
}

export async function createPullRequest(
	bearer: string,
	base: Ref,
	head: Ref,
	message: Message
) : Promise<PullRequest> {
	const gql = `
	mutation($input: CreatePullRequestInput!) {
		createPullRequest(input: $input) {
			pullRequest {
				id,
				url
			}
		}
	}`;

	const result = await octoql<{createPullRequest: {pullRequest: PullRequest}}>(gql, {
		input: {
			baseRefName: `refs/heads/${base.name}`,
			headRefName: `refs/heads/${head.name}`,
			repositoryId: base.repository.id,
			title: message.headline,
			body: message.body
		},
		headers: {
			authorization: `token ${bearer}`
		}
	});

	return result.createPullRequest.pullRequest;
}