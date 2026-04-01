import { WebClient } from '@slack/web-api';

const token = process.env['SLACK_BOT_TOKEN']; // .envからBotトークンを取得
const web = new WebClient(token);

async function joinTimesChannels() {
	try {
		// パブリックチャンネルのリストを取得
		const result = await web.conversations.list({
			types: 'public_channel',
			limit: 1000,
		});
		const channels = result.channels;
		console.log(channels?.length); // チャンネルの情報を表示
		if (!channels) throw new Error('channels is undefined');
		// `times-` プレフィックスがついたチャンネルにBotを追加
		for (const channel of channels) {
			if (channel.name?.startsWith('times-') && channel.is_archived === false) {
				console.log(channel.name);
				if (!channel.id) throw new Error('channel id is undefined');
				await web.conversations.join({ channel: channel.id });
				console.log(`Joined channel: ${channel.name}`);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

joinTimesChannels();
