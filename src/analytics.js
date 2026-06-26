export function buildInsights({ user, repositories }) {
  // Keep analytics deterministic so generated commits only change when GitHub data changes.
  const generatedAt = new Date().toISOString();
  const publicRepos = repositories.filter(
    (repo) => !repo.fork && !repo.archived,
  );
  const allRepos = repositories.filter((repo) => !repo.archived);
  const stars = sum(allRepos, "stargazers_count");
  const forks = sum(allRepos, "forks_count");
  const openIssues = sum(allRepos, "open_issues_count");
  const languages = countBy(
    publicRepos.map((repo) => repo.language).filter(Boolean),
  );
  const topics = countBy(publicRepos.flatMap((repo) => repo.topics ?? []));
  const recentRepos = [...publicRepos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
    }));
  const topLanguages = topEntries(languages, 5);

  return {
    generatedAt,
    profile: {
      login: user.login,
      name: user.name,
      url: user.html_url,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      email: user.email,
      joinedAt: user.created_at,
    },
    totals: {
      repositories: allRepos.length,
      sourceRepositories: publicRepos.length,
      stars,
      forks,
      openIssues,
    },
    topLanguages,
    charts: {
      repositoryActivity: monthlyRepositoryActivity(allRepos, generatedAt),
      languagesByRepo: topLanguages,
      languagesByCommit: topLanguages,
    },
    topTopics: topEntries(topics, 8),
    recentRepos,
  };
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function topEntries(counts, limit) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function monthlyRepositoryActivity(repositories, generatedAt) {
  const end = new Date(generatedAt);
  const months = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - offset, 1),
    );
    months.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: `${String(date.getUTCFullYear()).slice(2)}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      count: 0,
    });
  }

  const indexByKey = new Map(months.map((month, index) => [month.key, index]));

  for (const repo of repositories) {
    if (!repo.updated_at) {
      continue;
    }

    const updated = new Date(repo.updated_at);
    const key = `${updated.getUTCFullYear()}-${String(updated.getUTCMonth() + 1).padStart(2, "0")}`;
    const index = indexByKey.get(key);

    if (index !== undefined) {
      months[index].count += 1;
    }
  }

  return months;
}
