
"use client";

import { useState } from "react";

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
};

type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchGitHub(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = username.trim();
    if (!name) {
      setError("Please enter a GitHub username.");
      return;
    }

    setLoading(true);
    setError("");
    setUser(null);
    setRepos([]);

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(name)}`
      );

      if (response.status === 404) {
        throw new Error("Username not found. Please check the spelling.");
      }

      if (!response.ok) {
        throw new Error("GitHub is unavailable right now. Please try again.");
      }

      const profile: GitHubUser = await response.json();

      const repoResponse = await fetch(
        `https://api.github.com/users/${encodeURIComponent(name)}/repos?sort=stars&per_page=100`
      );

      if (!repoResponse.ok) {
        throw new Error("Could not load repositories. Please try again.");
      }

      const repositories: GitHubRepo[] = await repoResponse.json();

      setUser(profile);
      setRepos(
        repositories
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const languages = repos.reduce<Record<string, number>>((counts, repo) => {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
    return counts;
  }, {});

  const totalLanguages = Object.values(languages).reduce(
    (total, count) => total + count,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="text-2xl font-bold tracking-tight">
            Repo<span className="text-violet-400">Radar</span>
          </a>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            GitHub Explorer
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Discover developers
          </p>

         
<h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
  Your GitHub profile,
  <span className="block text-violet-400">decoded in seconds.</span>
</h1>


          <p className="mx-auto mt-5 max-w-xl text-slate-400">
            Discover developer statistics, popular repositories, and
            programming languages with RepoRadar.
          </p>

          <form
            onSubmit={searchGitHub}
            className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter GitHub username..."
              aria-label="GitHub username"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-4 outline-none transition focus:border-violet-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-500 px-6 py-4 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search GitHub"}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-400">
              {error}
            </p>
          )}
        </div>

        {loading && (
          <p className="mt-12 text-center text-slate-400" role="status">
            Loading GitHub profile...
          </p>
        )}

        {user && !loading && (
          <div className="mt-16 space-y-8">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <img
                  src={user.avatar_url}
                  alt={`${user.login}'s GitHub avatar`}
                  className="h-24 w-24 rounded-2xl border border-slate-700"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {user.name || user.login}
                  </h2>
                  <p className="mt-1 text-violet-400">@{user.login}</p>
                  <p className="mt-3 text-slate-400">
                    {user.bio || "No public bio provided."}
                  </p>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm text-violet-300 hover:underline"
                  >
                    View GitHub profile →
                  </a>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["Followers", user.followers],
                  ["Following", user.following],
                  ["Public repositories", user.public_repos],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <div>
                <h2 className="mb-5 text-xl font-bold">
                  Popular repositories
                </h2>

                {repos.length === 0 ? (
                  <p className="rounded-xl border border-slate-800 p-6 text-slate-400">
                    No public repositories found.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {repos.map((repo) => (
                      <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-violet-500"
                      >
                        <h3 className="break-words font-semibold text-violet-300">
                          {repo.name}
                        </h3>
                        <p className="mt-2 min-h-10 text-sm text-slate-400">
                          {repo.description || "No description provided."}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-300">
                          <span>★ {repo.stargazers_count}</span>
                          <span>{repo.language || "Other language"}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-bold">Languages</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Language distribution across the displayed repositories.
                </p>

                {totalLanguages === 0 ? (
                  <p className="mt-6 text-sm text-slate-400">
                    No language data available.
                  </p>
                ) : (
                  <div className="mt-6 space-y-5">
                    {Object.entries(languages)
                      .sort((a, b) => b[1] - a[1])
                      .map(([language, count]) => (
                        <div key={language}>
                          <div className="mb-2 flex justify-between gap-3 text-sm">
                            <span>{language}</span>
                            <span className="text-slate-400">
                              {Math.round((count / totalLanguages) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-violet-500"
                              style={{
                                width: `${(count / totalLanguages) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </aside>
            </section>
          </div>
        )}

        {!user && !loading && !error && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-dashed border-slate-800 p-8 text-center">
            <div className="text-4xl">⌘</div>
            <h2 className="mt-4 text-lg font-semibold">
              Your next discovery starts here
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter a public GitHub username above to explore their profile
              and repositories.
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-slate-800 px-5 py-6 text-center text-sm text-slate-500">
        Built with Next.js and the GitHub REST API · RepoRadar
      </footer>
    </main>
  );
}
