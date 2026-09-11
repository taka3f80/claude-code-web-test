import * as arxiv from './arxiv.mjs';
import * as jmaQuake from './jma-quake.mjs';
import * as wikipediaMostread from './wikipedia-mostread.mjs';
import * as hackernews from './hackernews.mjs';
import * as githubNewRepos from './github-new-repos.mjs';

export const SOURCES = Object.fromEntries(
  [arxiv, jmaQuake, wikipediaMostread, hackernews, githubNewRepos].map((m) => [m.id, m]),
);
