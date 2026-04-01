import { WebClient } from '@slack/web-api';
import { isTimesChannel } from './lib/timesChannel.ts';

const token = process.env['SLACK_BOT_TOKEN'];
if (!token) throw new Error('SLACK_BOT_TOKEN is undefined');
const web = new WebClient(token);

async function joinTimesChannels() {
	const result = await web.conversations.list({
		types: 'public_channel',
		limit: 1000,
	});
	const channels = result.channels;
	console.log(channels?.length);
	if (!channels) throw new Error('channels is undefined');

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
}

joinTimesChannels();
