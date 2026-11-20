// Mood's reminder message. Sending, subscription checks and time helpers are in push-core.mjs (shared with Weekly Digest).
import { sendAll } from './push-core.mjs';
export { localParts } from './push-core.mjs';

export const REMINDER = { title: 'How was your day?', body: 'Rate it from 0 to 10 — it takes a couple of seconds.', url: './' };

// Send a notification to all of the user's devices. Returns the subscriptions to keep.
export const sendTo = (subs, payload) => sendAll(subs, payload, { ttl: 3 * 3600 });
