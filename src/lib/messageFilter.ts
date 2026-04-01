import type { AllMessageEvents } from '@slack/types';

/**
 * 転送対象のメッセージかどうかを判定する。
 * subtypeを持つメッセージ(channel_join, message_changed, bot_message等)は
 * すべて転送対象外とする。hidden判定も不要(hidden: trueを持つのはsubtype付きのみ)。
 */
export function isForwardableMessage(
	message: AllMessageEvents,
	timesAllChannelId: string,
): boolean {
	if (message.subtype !== undefined) return false;
	if (message.channel_type !== 'channel') return false;
	if (message.channel === timesAllChannelId) return false;
	return true;
}
