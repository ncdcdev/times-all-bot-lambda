import * as v from 'valibot';

const EnvSchema = v.object({
	SLACK_SIGNING_SECRET: v.pipe(v.string(), v.nonEmpty()),
	SLACK_BOT_TOKEN: v.pipe(v.string(), v.nonEmpty()),
	TIMES_ALL_CHANNEL_ID: v.pipe(v.string(), v.nonEmpty()),
	WORKSPACE_URL: v.pipe(v.string(), v.url()),
});

export type Env = {
	slackSigningSecret: string;
	slackBotToken: string;
	timesAllChannelId: string;
	workspaceUrl: string;
};

export function loadEnv(): Env {
	const parsed = v.parse(EnvSchema, {
		SLACK_SIGNING_SECRET: process.env['SLACK_SIGNING_SECRET'],
		SLACK_BOT_TOKEN: process.env['SLACK_BOT_TOKEN'],
		TIMES_ALL_CHANNEL_ID: process.env['TIMES_ALL_CHANNEL_ID'],
		WORKSPACE_URL: process.env['WORKSPACE_URL'],
	});

	return {
		slackSigningSecret: parsed.SLACK_SIGNING_SECRET,
		slackBotToken: parsed.SLACK_BOT_TOKEN,
		timesAllChannelId: parsed.TIMES_ALL_CHANNEL_ID,
		workspaceUrl: parsed.WORKSPACE_URL,
	};
}
