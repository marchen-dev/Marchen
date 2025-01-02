// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { isDev } from '@base/lib/env'
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://f85c9c988eec1322b87e8f67eb05c207@o4508432333864960.ingest.us.sentry.io/4508573931864064',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  enabled: !isDev,
})
