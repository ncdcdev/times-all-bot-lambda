import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import { buildForwardText } from '../lib/forwardText.ts';
import { isForwardableMessage } from '../lib/messageFilter.ts';
import { buildMessageLink } from '../lib/messageLink.ts';
import { isTimesChannel } from '../lib/timesChannel.ts';

type SlackClient = (AllMiddlewareArgs &
	SlackEventMiddlewareArgs<'message'>)['client'];

const channelNameCache = new Map<string, string>();

async function getChannelName(
	client: SlackClient,
	channelId: string,
): Promise<string | undefined> {
	const cached = channelNameCache.get(channelId);
	if (cached !== undefined) {
		return cached;
	}
	try {
		const channelInfo = await client.conversations.info({
			channel: channelId,
		});
		const channelName = channelInfo.channel?.name;
		if (!channelName) {
			console.error('channel name not found', {
				channel: channelId,
				ok: channelInfo.ok,
				error: channelInfo.error,
			});
			return undefined;
		}
		channelNameCache.set(channelId, channelName);
		return channelName;
	} catch (error) {
		console.error('conversations.info failed', {
			channel: channelId,
			error: error instanceof Error ? error.message : error,
		});
		return undefined;
	}
}

export function createMessageHandler(
	timesAllChannelId: string,
	workspaceUrl: string,
) {
	return async ({
		message,
		client,
	}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>) => {
		console.log('received message', {
			channel: message.channel,
			subtype: message.subtype,
			ts: message.ts,
		});
		if (!isForwardableMessage(message, timesAllChannelId)) {
			console.log('skipped: not forwardable', { subtype: message.subtype });
			return;
		}

		const channelName = await getChannelName(client, message.channel);
		if (!channelName) {
			return;
		}
		if (!isTimesChannel(channelName)) {
			console.log('skipped: not a times channel', { channelName });
			return;
		}

		console.log('channel name starts with times-');
		const messageLink = buildMessageLink(
			workspaceUrl,
			message.channel,
			message.ts,
		);
		console.log('messageLink:', messageLink);
		const text = buildForwardText(messageLink, message.channel);
		await client.chat.postMessage({
			channel: timesAllChannelId,
			text,
		});
	};
}
