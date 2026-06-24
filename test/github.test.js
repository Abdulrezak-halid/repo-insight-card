import assert from "node:assert/strict";
import test from "node:test";
import { GitHubClient } from "../src/github.js";
import { RateLimitError } from "../src/errors.js";

test("GitHubClient sends GitHub API headers", async () => {
  const calls = [];
  const client = new GitHubClient({
    token: "token-value",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ login: "octocat" });
    },
  });

  await client.getUser("octocat");

  assert.equal(calls[0].options.headers.Authorization, "Bearer token-value");
  assert.equal(calls[0].options.headers.Accept, "application/vnd.github+json");
  assert.match(String(calls[0].url), /\/users\/octocat$/);
});

test("GitHubClient raises a typed rate limit error", async () => {
  const client = new GitHubClient({
    fetchImpl: async () =>
      jsonResponse(
        { message: "rate limited" },
        {
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": "1782259200",
          },
        },
      ),
  });

  await assert.rejects(() => client.getUser("octocat"), RateLimitError);
});

function jsonResponse(body, init = {}) {
  const headers = new Map(Object.entries(init.headers ?? {}));
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: {
      get: (name) =>
        headers.get(name.toLowerCase()) ?? headers.get(name) ?? null,
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}
