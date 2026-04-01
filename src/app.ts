import { App, AwsLambdaReceiver } from '@slack/bolt';
import type { Env } from './env.ts';
import { handleChannelCreated } from './handlers/channelCreated.ts';
import { createMessageHandler } from './handlers/message.ts';

export interface SlackApp {
	app: App;
	receiver: AwsLambdaReceiver;
}

export function createSlackApp(env: Env): SlackApp {
	const receiver = new AwsLambdaReceiver({
		signingSecret: env.slackSigningSecret,
	});

	const app = new App({
		token: env.slackBotToken,
		receiver,
	});

	app.message(createMessageHandler(env.timesAllChannelId, env.workspaceUrl));
	app.event('channel_created', handleChannelCreated);

	return { app, receiver };
}
