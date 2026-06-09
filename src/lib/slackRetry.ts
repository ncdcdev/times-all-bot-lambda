import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function isSlackRetryDueToTimeout(
	headers: APIGatewayProxyEventV2['headers'],
): boolean {
	return (
		!!headers['x-slack-retry-num'] &&
		headers['x-slack-retry-reason'] === 'http_timeout'
	);
}
