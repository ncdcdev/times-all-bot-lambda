import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createSlackApp } from './app.ts';
import { loadEnv } from './env.ts';
import { isSlackRetryDueToTimeout } from './lib/slackRetry.ts';

const env = loadEnv();
const { receiver } = createSlackApp(env);

// Lambdaのイベント処理
// Node.js 24ではcallbackベースのハンドラーが廃止されたため、
// AwsLambdaReceiverのハンドラーを2引数のasync関数でラップする
// ref: https://github.com/slackapi/bolt-js/issues/2761
export const handler = async (
	event: APIGatewayProxyEventV2,
	context: unknown,
) => {
	if (isSlackRetryDueToTimeout(event.headers)) {
		console.log('skipped: slack retry (http_timeout)', {
			retryNum: event.headers['x-slack-retry-num'],
		});
		return { statusCode: 200, body: 'ok (retry skipped)' };
	}

	const boltHandler = await receiver.start();
	return boltHandler(event, context);
};
