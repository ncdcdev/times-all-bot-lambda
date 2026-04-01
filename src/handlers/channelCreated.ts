import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import { isTimesChannel } from '../lib/timesChannel.ts';

export async function handleChannelCreated({
	event,
	client,
	logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'channel_created'>) {
	const { name, id } = event.channel;
	if (!name || !isTimesChannel(name)) {
		return;
	}
	logger.debug(name);
	await client.conversations.join({ channel: id });
	logger.info(`Joined channel: ${name}`);
}
