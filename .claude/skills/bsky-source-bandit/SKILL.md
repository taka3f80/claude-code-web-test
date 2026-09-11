---
name: bsky-source-bandit
description: Weekly review of the Bluesky source bandit. Reads data/bsky reports and logs, judges which sources are working, proposes at most one source change, and never touches the daily loop's numbers on its own.
---

# Bluesky source bandit: weekly review

The daily loop (GitHub Actions, `bandit/`) posts and measures without an LLM.
This skill is the editor-in-chief step a human or Claude runs about once a week.

## Read first

- `bandit/README.md` for how the loop works.
- Latest `data/bsky/reports/*.md`; if none is fresh, run `cd bandit && node src/run-report.mjs 7`.
- `data/bsky/runs.json` (last 7 entries) for `fetch-error` / `no-fresh-item` / `post-error` streaks.
- `data/bsky/bandit-state.json` for posteriors.

## Judge

For each source, answer in one line each:
- Is it producing items? (streaks of `no-fresh-item` or `fetch-error` mean the fetcher, not the audience, is the problem.)
- Is it earning reward? Compare `alpha/(alpha+beta)` and avg score against the others. Fewer than 5 measured posts means "too early", not "bad".
- Is the audience changing? Follower delta from `profile-history.json`.

## Act (at most one of these per review)

- Fix a broken fetcher (a code change in `bandit/src/sources/`, with a test).
- Propose a new source: name the public data, the URL pattern, the post template, and why it fits the "real data, no opinion" rule. Implement it only if the human says yes.
- Disable a source that has 10+ measured posts and a posterior mean clearly below the rest.

Do not change `postsPerDay`, `explorationDays`, or the reward formula in a review. Those are the human's levers.

## Guardrails

- Never post to Bluesky from this skill. Posting belongs to the daily workflow.
- Never rewrite past rows in `posts.json`, `runs.json`, or `profile-history.json`.
- Never print or commit `BSKY_APP_PASSWORD` or any token.
- Report what the data shows. Do not predict that a change "will" improve engagement; the next report decides.

## Report back

Five lines: sources ranked by posterior mean, follower delta, errors seen, the one change made or proposed, what to look at next week.
