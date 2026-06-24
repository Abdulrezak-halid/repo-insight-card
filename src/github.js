import { GitHubApiError, RateLimitError } from "./errors.js";

const API_VERSION = "2022-11-28";

export class GitHubClient {
  constructor({
    token,
    apiBaseUrl = "https://api.github.com",
    fetchImpl = globalThis.fetch,
    logger,
  }) {
    if (!fetchImpl) {
      throw new Error(
        "A fetch implementation is required. Use Node.js 20 or newer.",
      );
    }

    this.token = token;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    this.fetch = fetchImpl;
    this.logger = logger;
  }

  async request(endpoint) {
    const url = new URL(endpoint, `${this.apiBaseUrl}/`);
    this.logger?.debug("Requesting GitHub API endpoint", {
      endpoint: url.pathname + url.search,
    });

    const response = await this.fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": API_VERSION,
        "User-Agent": "repo-insight-card",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });

    const remaining = Number(
      response.headers.get("x-ratelimit-remaining") ?? "1",
    );
    const reset = Number(response.headers.get("x-ratelimit-reset") ?? "0");

    if (remaining === 0) {
      const resetAt = reset ? new Date(reset * 1000).toISOString() : undefined;
      throw new RateLimitError("GitHub API rate limit exhausted.", {
        endpoint,
        resetAt,
      });
    }

    if (!response.ok) {
      const responseBody = await safeReadBody(response);
      throw new GitHubApiError(
        `GitHub API request failed with status ${response.status}.`,
        {
          status: response.status,
          endpoint,
          responseBody,
        },
      );
    }

    return response.json();
  }

  /**
   * Fetch public profile metadata for the selected GitHub account.
   * Endpoint: GET /users/{username}
   */
  async getUser(username) {
    return this.request(`/users/${encodeURIComponent(username)}`);
  }

  /**
   * Fetch owned repositories used to compute repository analytics.
   * Endpoint: GET /users/{username}/repos
   */
  async getUserRepositories(username) {
    const repos = [];
    let page = 1;

    while (page <= 5) {
      const batch = await this.request(
        `/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=${page}`,
      );

      repos.push(...batch);

      if (batch.length < 100) {
        break;
      }

      page += 1;
    }

    return repos;
  }
}

async function safeReadBody(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
