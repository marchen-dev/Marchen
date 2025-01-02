// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
