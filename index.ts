// index.ts
import dotenv from 'dotenv';
dotenv.config();
import { App, AwsLambdaReceiver, GenericMessageEvent } from '@slack/bolt';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
if (!SLACK_SIGNING_SECRET) throw new Error('signing secret is undefined');

// AWS Lambdaのレシーバーを作成
const awsLambdaReceiver = new AwsLambdaReceiver({
	signingSecret: SLACK_SIGNING_SECRET,
});

// Slack Appの設定情報
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: awsLambdaReceiver,
});

const TIMES_ALL_CHANNEL_ID = process.env.TIMES_ALL_CHANNEL_ID; // `times-all` チャンネルのIDを設定
if (!TIMES_ALL_CHANNEL_ID) throw new Error('times-all channel is undefined');
const WORKSPACE_URL = process.env.WORKSPACE_URL; // SlackワークスペースのURLを設定
if (!WORKSPACE_URL) throw new Error('workspace is undefined');

// 型ガード関数
function isGenericMessageEvent(event: unknown): event is GenericMessageEvent {
	return (event as GenericMessageEvent).type === 'message';
}

// 'times-'プレフィックスがついたチャンネルのメッセージを検出
app.message(async ({ message, client }) => {
	console.log('received message');
	if (!isGenericMessageEvent(message)) {
		console.log('not a message event');
		return;
	}
	// メッセージがチャンネルからのものかどうか確認
	if (
		'channel' in message &&
		message.channel_type === 'channel' &&
		message.channel !== TIMES_ALL_CHANNEL_ID
	) {
		console.log('time-all以外のチャンネル');
		// チャンネルの情報を取得
		const channelInfo = await client.conversations.info({
			channel: message.channel,
		});
		console.log('channelInfo:', channelInfo);
		// チャンネル名が'times-'で始まる場合、メッセージを'times-all'に転載
		if (channelInfo.channel?.name?.startsWith('times-')) {
			console.log('channel name starts with times-');
			if ('hidden' in message) {
				return;
			} //hidden subtypeがある場合は無視
			// https://api.slack.com/events/message#hidden_subtypes
			if ('subtype' in message && message.subtype === 'channel_join') {
				return;
			} //チャンネル参加メッセージは無視
			const messageTimestamp = message.ts.replace('.', '');
			const messageLink = `${WORKSPACE_URL}/archives/${message.channel}/p${messageTimestamp}`;
			console.log('messageLink:', messageLink);
			await client.chat.postMessage({
				channel: TIMES_ALL_CHANNEL_ID,
				text: `<${messageLink}|このメッセージ> が <#${message.channel}> で投稿されました。`,
			});
		} else {
			console.log(channelInfo.channel?.name);
		}
	}
});

app.event('channel_created', async ({ event, client, logger }) => {
	if (event.channel.name?.startsWith('times-')) {
		logger.debug(event.channel.name);
		await client.conversations.join({ channel: event.channel.id });
		logger.info(`Joined channel: ${event.channel.name}`);
	}
});

// Lambdaのイベント処理
// Node.js 24ではcallbackベースのハンドラーが廃止されたため、
// AwsLambdaReceiverのハンドラーを2引数のasync関数でラップする
// ref: https://github.com/slackapi/bolt-js/issues/2761
export const handler = async (
	event: Record<string, unknown>,
	context: unknown,
) => {
	const boltHandler = await awsLambdaReceiver.start();
	// boltHandlerは内部的にcallbackを使用しないが、型定義上3引数が必須
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return boltHandler(event as any, context, () => {});
};
