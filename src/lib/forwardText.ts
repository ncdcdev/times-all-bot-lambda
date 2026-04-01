export function buildForwardText(
	messageLink: string,
	channelId: string,
): string {
	return `<${messageLink}|このメッセージ> が <#${channelId}> で投稿されました。`;
}
