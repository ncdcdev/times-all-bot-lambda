import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function isSlackRetry(
	headers: APIGatewayProxyEventV2['headers'],
): boolean {
	return !!headers['x-slack-retry-num'];
}
