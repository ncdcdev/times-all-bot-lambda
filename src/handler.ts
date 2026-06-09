import { createSlackApp } from './app.ts';
import { loadEnv } from './env.ts';
import type { SlackHeaders } from './lib/slackRetry.ts';
import { isSlackRetry } from './lib/slackRetry.ts';

const env = loadEnv();
const { receiver } = createSlackApp(env);

// Lambdaのイベント処理
// Node.js 24ではcallbackベースのハンドラーが廃止されたため、
// AwsLambdaReceiverのハンドラーを2引数のasync関数でラップする
// ref: https://github.com/slackapi/bolt-js/issues/2761
export const handler = async (
	event: Record<string, unknown>,
	context: unknown,
) => {
	// biome-ignore lint/suspicious/noExplicitAny: AwsEventの型がexportされていないため
	const headers = (event as any).headers as SlackHeaders;
	if (isSlackRetry(headers)) {
		console.log('skipped: slack retry', {
			retryNum: headers?.['x-slack-retry-num'],
			retryReason: headers?.['x-slack-retry-reason'] ?? 'unknown',
		});
		return { statusCode: 200, body: 'ok (retry skipped)' };
	}

	const boltHandler = await receiver.start();
	// biome-ignore lint/suspicious/noExplicitAny: AwsEventの型がexportされていないため
	return boltHandler(event as any, context, () => {});
};
