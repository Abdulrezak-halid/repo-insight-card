import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildInsights } from "./analytics.js";
import { loadConfig } from "./config.js";
import { GitHubClient } from "./github.js";
import { createLogger } from "./logger.js";
import { renderMarkdown, renderSvg } from "./render.js";
import { upsertGeneratedSection } from "./readme.js";

export async function main(env = process.env) {
  const config = loadConfig(env);
  const logger = createLogger(config.logLevel);
  const client = new GitHubClient({
    token: config.token,
    apiBaseUrl: config.apiBaseUrl,
    logger,
  });

  logger.info("Fetching GitHub profile and repository data", {
    username: config.username,
  });
  const [user, repositories] = await Promise.all([
    client.getUser(config.username),
    client.getUserRepositories(config.username),
  ]);

  const insights = buildInsights({ user, repositories });
  const markdown = renderMarkdown(insights);
  const svg = renderSvg(insights);

  // Generated artifacts are intentionally committed by GitHub Actions for public visibility.
  await mkdir(config.outputDir, { recursive: true });
  await writeFile(path.join(config.outputDir, "profile-card.svg"), svg);
  await writeFile(
    path.join(config.outputDir, "insights.json"),
    `${JSON.stringify(insights, null, 2)}\n`,
  );

  if (config.updateReadme) {
    const existingReadme = await readFile(config.readmePath, "utf8").catch(
      () => "# Repo Insight Card\n",
    );
    await writeFile(
      config.readmePath,
      upsertGeneratedSection(existingReadme, markdown),
    );
  }

  logger.info("Generated GitHub insight artifacts", {
    outputDir: config.outputDir,
    readmeUpdated: config.updateReadme,
  });

  return insights;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(
      JSON.stringify({
        level: "error",
        time: new Date().toISOString(),
        message: error.message,
        name: error.name,
        status: error.status,
        endpoint: error.endpoint,
        resetAt: error.resetAt,
      }),
    );
    process.exitCode = 1;
  });
}
