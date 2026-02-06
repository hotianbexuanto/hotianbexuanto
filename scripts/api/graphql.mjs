import { graphql } from '@octokit/graphql';

const token = process.env.GH_READ_TOKEN || process.env.GITHUB_TOKEN;

const client = graphql.defaults({
  headers: {
    ...(token ? { authorization: `token ${token}` } : {}),
  },
});

/**
 * Fetch user profile stats
 */
export async function fetchUserStats(login) {
  const { user } = await client(`
    query($login: String!) {
      user(login: $login) {
        name
        bio
        avatarUrl
        followers { totalCount }
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC) {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          contributionCalendar {
            totalContributions
          }
        }
        repositoriesContributedTo(first: 1) {
          totalCount
        }
      }
    }
  `, { login });

  // Calculate total stars
  const { user: starUser } = await client(`
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes { stargazerCount }
        }
      }
    }
  `, { login });

  const totalStars = starUser.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0);

  return {
    name: user.name || login,
    bio: user.bio || '',
    avatarUrl: user.avatarUrl,
    followers: user.followers.totalCount,
    repos: user.repositories.totalCount,
    totalStars,
    totalCommits: user.contributionsCollection.totalCommitContributions,
    totalPRs: user.contributionsCollection.totalPullRequestContributions,
    totalIssues: user.contributionsCollection.totalIssueContributions,
    totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
  };
}

/**
 * Fetch top languages across repos
 */
export async function fetchLanguages(login) {
  const { user } = await client(`
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
          nodes {
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
      }
    }
  `, { login });

  const langMap = {};
  for (const repo of user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const name = edge.node.name;
      if (!langMap[name]) {
        langMap[name] = { size: 0, color: edge.node.color || '#B186D6' };
      }
      langMap[name].size += edge.size;
    }
  }

  // Use total across ALL languages for accurate percentages
  const allTotal = Object.values(langMap).reduce((sum, v) => sum + v.size, 0);

  const sorted = Object.entries(langMap)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 8);

  return sorted.map(([name, { size, color }]) => ({
    name,
    percent: Math.round((size / allTotal) * 1000) / 10,
    color,
  }));
}

/**
 * Fetch contribution calendar for streak and graph
 */
export async function fetchContributions(login) {
  const { user } = await client(`
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `, { login });

  const days = user.contributionsCollection.contributionCalendar.weeks
    .flatMap(w => w.contributionDays)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate current streak (walk backwards from today)
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      currentStreak++;
    } else {
      // Allow today to be zero (day not over yet) - check yesterday
      if (i === days.length - 1) continue;
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Last 30 days for graph
  const last30 = days.slice(-30).map(d => d.contributionCount);
  const last30Dates = days.slice(-30).map(d => d.date);

  return {
    currentStreak,
    longestStreak,
    totalContributions: days.reduce((s, d) => s + d.contributionCount, 0),
    last30Days: last30,
    last30Dates,
  };
}

/**
 * Fetch recent activity (commits, PRs, issues)
 */
export async function fetchRecentActivity(login) {
  const { user } = await client(`
    query($login: String!) {
      user(login: $login) {
        repositories(first: 5, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
          nodes {
            name
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 3) {
                    nodes {
                      message
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
        pullRequests(first: 3, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            title
            createdAt
          }
        }
        issues(first: 2, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            title
            createdAt
          }
        }
      }
    }
  `, { login });

  const activities = [];

  // Commits
  for (const repo of user.repositories.nodes) {
    const history = repo.defaultBranchRef?.target?.history?.nodes || [];
    for (const commit of history) {
      activities.push({
        type: 'commit',
        message: `${repo.name}: ${commit.message.split('\n')[0]}`,
        date: new Date(commit.committedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: new Date(commit.committedDate).getTime(),
      });
    }
  }

  // PRs
  for (const pr of user.pullRequests.nodes) {
    activities.push({
      type: 'pr',
      message: pr.title,
      date: new Date(pr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: new Date(pr.createdAt).getTime(),
    });
  }

  // Issues
  for (const issue of user.issues.nodes) {
    activities.push({
      type: 'issue',
      message: issue.title,
      date: new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: new Date(issue.createdAt).getTime(),
    });
  }

  // Sort by most recent and return top 4
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
}

/**
 * Fetch weekly contribution breakdown (commits, PRs, issues) for line chart
 * Returns 12 weeks of data
 */
export async function fetchWeeklyStats(login) {
  const { user } = await client(`
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          commitContributionsByRepository(maxRepositories: 100) {
            contributions(first: 100, orderBy: {direction: DESC}) {
              nodes { occurredAt }
            }
          }
          pullRequestContributions(first: 50, orderBy: {direction: DESC}) {
            nodes { occurredAt }
          }
          issueContributions(first: 50, orderBy: {direction: DESC}) {
            nodes { occurredAt }
          }
        }
      }
    }
  `, { login });

  // Build 12-week buckets (most recent 12 weeks)
  const now = new Date();
  const weekStarts = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - i * 7);
    d.setHours(0, 0, 0, 0);
    weekStarts.push(d);
  }

  const commits = new Array(12).fill(0);
  const prs = new Array(12).fill(0);
  const issues = new Array(12).fill(0);

  function weekIndex(dateStr) {
    const t = new Date(dateStr).getTime();
    for (let i = 11; i >= 0; i--) {
      if (t >= weekStarts[i].getTime()) return i;
    }
    return -1;
  }

  const cc = user.contributionsCollection;
  for (const repo of cc.commitContributionsByRepository) {
    for (const n of repo.contributions.nodes) {
      const idx = weekIndex(n.occurredAt);
      if (idx >= 0) commits[idx]++;
    }
  }
  for (const n of cc.pullRequestContributions.nodes) {
    const idx = weekIndex(n.occurredAt);
    if (idx >= 0) prs[idx]++;
  }
  for (const n of cc.issueContributions.nodes) {
    const idx = weekIndex(n.occurredAt);
    if (idx >= 0) issues[idx]++;
  }

  const labels = weekStarts.map(d => `${d.getMonth() + 1}/${d.getDate()}`);
  return { commits, prs, issues, labels };
}
export async function fetchTimeDistribution(login) {
  // Fetch commits from recent active repos
  const { user } = await client(`
    query($login: String!) {
      user(login: $login) {
        repositories(first: 20, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false) {
          nodes {
            name
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100) {
                    nodes {
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, { login });

  const hours = new Array(24).fill(0);

  for (const repo of user.repositories.nodes) {
    const commits = repo.defaultBranchRef?.target?.history?.nodes || [];
    for (const commit of commits) {
      const date = new Date(commit.committedDate);
      hours[date.getUTCHours()]++;
    }
  }

  return hours;
}
