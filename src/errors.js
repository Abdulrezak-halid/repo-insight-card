export class GitHubApiError extends Error {
  constructor(message, { status, endpoint, responseBody } = {}) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.responseBody = responseBody;
  }
}

export class RateLimitError extends GitHubApiError {
  constructor(message, { endpoint, resetAt } = {}) {
    super(message, { status: 403, endpoint });
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
}
