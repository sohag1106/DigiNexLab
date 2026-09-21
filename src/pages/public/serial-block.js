// Staged-publishing gate for the 100-city article factory.
// Only the first LIVE_COUNT articles from buildCityArticles() ship in the
// build. Bump LIVE_COUNT (via scripts/publish-batch.mjs) to publish the next
// batch — this is what keeps us from dumping 100 near-identical pages at once
// (the doorway-page pattern Google filters).

import { buildCityArticles } from './kicker-focus.js'

export const LIVE_COUNT = 100

export function livePosts() {
  return buildCityArticles(LIVE_COUNT)
}