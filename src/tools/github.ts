import { Octokit } from '@octokit/rest';

export class GitHubTools {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  async addComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<{ id: number; url: string }> {
    const response = await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body
    });

    return {
      id: response.data.id,
      url: response.data.html_url
    };
  }

  async addLabel(
    owner: string,
    repo: string,
    issueNumber: number,
    labels: string[]
  ): Promise<{ labels: string[] }> {
    const response = await this.octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels
    });

    return {
      labels: response.data.map(l => l.name)
    };
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<{ content: string; sha: string }> {
    const response = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref
    });

    if ('content' in response.data && typeof response.data.content === 'string') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return {
        content,
        sha: response.data.sha
      };
    }

    throw new Error('Not a file or content not available');
  }

  async getRepository(
    owner: string,
    repo: string
  ): Promise<{ name: string; description: string | null; defaultBranch: string }> {
    const response = await this.octokit.repos.get({
      owner,
      repo
    });

    return {
      name: response.data.name,
      description: response.data.description,
      defaultBranch: response.data.default_branch
    };
  }

  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<{
    title: string;
    body: string | null;
    state: string;
    headRef: string;
    baseRef: string;
  }> {
    const response = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber
    });

    return {
      title: response.data.title,
      body: response.data.body,
      state: response.data.state,
      headRef: response.data.head.ref,
      baseRef: response.data.base.ref
    };
  }

  async getIssue(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<{
    title: string;
    body: string | null;
    state: string;
    labels: string[];
  }> {
    const response = await this.octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber
    });

    return {
      title: response.data.title,
      body: response.data.body ?? null,
      state: response.data.state,
      labels: response.data.labels.map(l => (typeof l === 'string' ? l : l.name || ''))
    };
  }
}
