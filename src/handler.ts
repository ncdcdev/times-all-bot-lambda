import { createSlackApp } from './app.ts';
import { loadEnv } from './env.ts';

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
	const boltHandler = await receiver.start();
	// boltHandlerは内部的にcallbackを使用しないが、型定義上3引数が必須
	// biome-ignore lint/suspicious/noExplicitAny: AwsEventの型がexportされていないため
	return boltHandler(event as any, context, () => {});
};
