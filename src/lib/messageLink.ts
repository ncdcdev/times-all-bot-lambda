export function buildMessageLink(
	workspaceUrl: string,
	channelId: string,
	ts: string,
): string {
	const timestamp = ts.replace('.', '');
	return `${workspaceUrl}/archives/${channelId}/p${timestamp}`;
}
