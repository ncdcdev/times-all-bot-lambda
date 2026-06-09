import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export type SlackHeaders = APIGatewayProxyEventV2['headers'] | undefined;

export function isSlackRetry(headers: SlackHeaders): boolean {
	return !!headers?.['x-slack-retry-num'];
}
