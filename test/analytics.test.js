import assert from "node:assert/strict";
import test from "node:test";
import { buildInsights } from "../src/analytics.js";

test("buildInsights summarizes public repository data", () => {
  const insights = buildInsights({
    user: {
      login: "octocat",
      name: "The Octocat",
      html_url: "https://github.com/octocat",
      avatar_url: "https://github.com/images/error/octocat_happy.gif",
      public_repos: 2,
      followers: 42,
      following: 1,
    },
    repositories: [
      {
        name: "hello-world",
        html_url: "https://github.com/octocat/hello-world",
        description: "My first repo",
        language: "JavaScript",
        stargazers_count: 10,
        forks_count: 2,
        open_issues_count: 1,
        topics: ["github-api"],
        fork: false,
        archived: false,
        updated_at: "2026-06-01T00:00:00Z",
      },
      {
        name: "forked",
        html_url: "https://github.com/octocat/forked",
        description: "Fork",
        language: "Ruby",
        stargazers_count: 3,
        forks_count: 1,
        open_issues_count: 0,
        topics: [],
        fork: true,
        archived: false,
        updated_at: "2026-05-01T00:00:00Z",
      },
    ],
  });

  assert.equal(insights.profile.login, "octocat");
  assert.equal(insights.totals.repositories, 2);
  assert.equal(insights.totals.sourceRepositories, 1);
  assert.equal(insights.totals.stars, 13);
  assert.deepEqual(insights.topLanguages, [{ name: "JavaScript", count: 1 }]);
});
