import type { AllMessageEvents } from '@slack/types';

/**
 * 転送対象のsubtype。
 * undefinedも転送対象（通常のメッセージ）。
 * https://api.slack.com/events/message#subtypes
 */
const forwardableSubtypes = new Set<string | undefined>([
	undefined,
	'file_share',
	'me_message',
	'thread_broadcast',
]);

/**
 * 転送対象のメッセージかどうかを判定する。
 */
export function isForwardableMessage(
	message: AllMessageEvents,
	timesAllChannelId: string,
): boolean {
	if (!forwardableSubtypes.has(message.subtype)) return false;
	if (message.channel_type !== 'channel') return false;
	if (message.channel === timesAllChannelId) return false;
	return true;
}
