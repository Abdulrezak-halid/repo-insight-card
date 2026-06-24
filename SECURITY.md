# Security Policy

## Reporting a Vulnerability

Please email abdulrezak.khaled+repo-insight-card@gmail.com for security issues or responsible disclosure.

Do not open public issues for token leaks, private data exposure, or account-specific security concerns.

## Token Scope

Repo Insight Card only needs read access to public GitHub API data. In GitHub Actions, the default `GITHUB_TOKEN` is used with `contents: write` only so the workflow can commit generated artifacts back to the repository.
