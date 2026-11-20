// Weekly Digest's notification. Sending, subscription checks and time helpers are in push-core.mjs (shared with Mood).
// The push carries no personal numbers: the server never reads the user's data.
import { sendAll } from './push-core.mjs';
export { localParts } from './push-core.mjs';

export const DIGEST = { title: 'Your week in review is ready', body: 'Mood, habits, spending and reading — tap to open the stories.', url: './?open=stories' };

// Send a notification to all of the user's devices. Returns the subscriptions to keep.
export const sendTo = (subs, payload) => sendAll(subs, payload, { ttl: 6 * 3600 });
