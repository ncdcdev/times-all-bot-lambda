import { WebClient } from '@slack/web-api';
import { isTimesChannel } from './lib/timesChannel.ts';

const token = process.env['SLACK_BOT_TOKEN'];
if (!token) throw new Error('SLACK_BOT_TOKEN is undefined');
const web = new WebClient(token);

async function joinTimesChannels() {
	let cursor: string | undefined;

	do {
		const result = await web.conversations.list({
			types: 'public_channel',
			limit: 1000,
			...(cursor ? { cursor } : {}),
		});
		const channels = result.channels;
		if (!channels || channels.length === 0) break;

		console.log(`fetched ${channels.length} channels`);

		for (const channel of channels) {
			if (
				channel.name &&
				isTimesChannel(channel.name) &&
				channel.is_archived === false
			) {
				console.log(channel.name);
				if (!channel.id) throw new Error('channel id is undefined');
				await web.conversations.join({ channel: channel.id });
				console.log(`Joined channel: ${channel.name}`);
			}
		}

		cursor = result.response_metadata?.next_cursor || undefined;
	} while (cursor);
}

joinTimesChannels();
