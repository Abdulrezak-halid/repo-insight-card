export function loadConfig(env = process.env) {
  const username = env.GITHUB_USERNAME || env.GITHUB_REPOSITORY_OWNER;

  if (!username) {
    throw new Error(
      "GITHUB_USERNAME is required when GITHUB_REPOSITORY_OWNER is not available.",
    );
  }

  return {
    token: env.GITHUB_TOKEN || "",
    username,
    outputDir: env.OUTPUT_DIR || "dist",
    readmePath: env.README_PATH || "README.md",
    apiBaseUrl: env.GITHUB_API_URL || "https://api.github.com",
    logLevel: env.LOG_LEVEL || "info",
    updateReadme: env.UPDATE_README !== "false",
  };
}
