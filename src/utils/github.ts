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
	additions: Array<{
		path: string,
		contents: string
	}>,
	deletions: Array<{
		path: string
	}>
}

export interface Commit {
	oid: string
}

export interface PullRequest {
	id: string,
	url: string
}

export class GithubClient {
	bearer: string;
	constructor(bearer: string) {
		this.bearer = bearer;
	}

	private async octoql<T>(gql: string, parameters: object) : Promise<T> {
		if(!this.bearer) throw 'Bearer token not set';

		return await octoql<T>(gql, {
			...parameters,
			headers: {
				authorization: `token ${this.bearer}`
			}
		});
	}

	makeCompareUrl(branch: Ref) {
		return `https://github.com/${branch.repository.owner.login}/${branch.repository.name}/compare/${branch.name}?expand=1`;
	}
	
	async getRef(
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
	
		const {repository} = await this.octoql<{repository: {ref: Ref}}>(gql, {
			owner, repo, path
		});
	
		return repository.ref;
	}

	async getRefs(
		owner: string,
		repo: string, 
		prefix: string
	) : Promise<Ref[]> {
		const gql = `
		query ref($owner: String!, $repo: String!, $prefix: String!) {
			repository(owner: $owner, name: $repo) {
				refs(refPrefix: $prefix, first: 100) {
					edges {
						node {
							id,
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
				}
			}
		}`;
	
		const {repository} = await this.octoql<{repository: {
			refs: {edges: {node: Ref}[]}
		}}>(gql, {
			owner, repo, prefix
		});
	
		return repository.refs.edges.map(e => e.node);
	}

	async getObjectText(
		owner: string, 
		repo: string, 
		objectExpression: string
	) : Promise<string> {
		const gql = `
		query ref($owner: String!, $repo: String!, $objectExpression: String!) {
			repository(owner: $owner, name: $repo) {
				content: object(expression: $objectExpression) {
					... on Blob{
						text
					}
				}
			}
		}`;

		const {repository} = await this.octoql<{repository: {content: {text: string}}}>(gql, {
			owner, repo, objectExpression
		});
	
		return repository.content.text;
	}
	
	async createRef(
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
	
		const result = await this.octoql<{createRef: {ref: Ref}}>(gql, {
			input: {
				name: `refs/heads/${name}`,
				oid: base.target.oid,
				repositoryId: base.repository.id
			}
		});
	
		return result.createRef.ref;
	}
	
	async createCommitOnBranch(
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
	
		const result = await this.octoql<{createCommitOnBranch: {commit: Commit}}>(gql, {
			input: {
				branch: {
					id: branch.id
				},
				expectedHeadOid: branch.target.oid,
				fileChanges,
				message
			}
		});
	
		return result.createCommitOnBranch.commit;
	}
	
	async createPullRequest(
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
	
		const result = await this.octoql<{createPullRequest: {pullRequest: PullRequest}}>(gql, {
			input: {
				baseRefName: `refs/heads/${base.name}`,
				headRefName: `refs/heads/${head.name}`,
				repositoryId: base.repository.id,
				title: message.headline,
				body: message.body
			}
		});
	
		return result.createPullRequest.pullRequest;
	}
}
