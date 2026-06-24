export function buildInsights({ user, repositories }) {
  // Keep analytics deterministic so generated commits only change when GitHub data changes.
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

  return {
    generatedAt: new Date().toISOString(),
    profile: {
      login: user.login,
      name: user.name,
      url: user.html_url,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
    },
    totals: {
      repositories: allRepos.length,
      sourceRepositories: publicRepos.length,
      stars,
      forks,
      openIssues,
    },
    topLanguages: topEntries(languages, 5),
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
