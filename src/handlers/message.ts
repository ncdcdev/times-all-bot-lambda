import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import { buildForwardText } from '../lib/forwardText.ts';
import { isForwardableMessage } from '../lib/messageFilter.ts';
import { buildMessageLink } from '../lib/messageLink.ts';
import { isTimesChannel } from '../lib/timesChannel.ts';

export function createMessageHandler(
	timesAllChannelId: string,
	workspaceUrl: string,
) {
	return async ({
		message,
		client,
	}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'message'>) => {
		console.log('received message');
		if (!isForwardableMessage(message, timesAllChannelId)) {
			return;
		}

		const channelInfo = await client.conversations.info({
			channel: message.channel,
		});
		const channelName = channelInfo.channel?.name;
		if (!channelName || !isTimesChannel(channelName)) {
			console.log(channelName);
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
