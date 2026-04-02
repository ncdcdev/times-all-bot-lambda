import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { createMessageHandler } from '../message.ts';

describe('createMessageHandler', () => {
	const timesAllChannelId = 'C_TIMES_ALL';
	const workspaceUrl = 'https://workspace.slack.com';

	function makeArgs(
		message: Record<string, unknown>,
		channelName: string | undefined = 'times-yamada',
	) {
		return {
			message,
			client: {
				conversations: {
					info: mock.fn(() =>
						Promise.resolve({
							channel: { name: channelName },
						}),
					),
				},
				chat: {
					postMessage: mock.fn(() => Promise.resolve()),
				},
			},
		};
	}

	it('timesチャンネルのメッセージをtimes-allに転送する', async () => {
		const handler = createMessageHandler(timesAllChannelId, workspaceUrl);
		const message = {
			type: 'message',
			subtype: undefined,
			channel: 'C_TIMES_YAMADA',
			channel_type: 'channel',
			text: 'hello',
			ts: '1234567890.123456',
			user: 'U12345',
		};
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args = makeArgs(message) as any;
		await handler(args);

		assert.equal(args.client.chat.postMessage.mock.callCount(), 1);
		const call = args.client.chat.postMessage.mock.calls[0];
		assert.equal(call.arguments[0].channel, timesAllChannelId);
		assert.ok(
			(call.arguments[0].text as string).includes(
				'https://workspace.slack.com/archives/C_TIMES_YAMADA/p1234567890123456',
			),
		);
	});

	it('times-以外のチャンネルは転送しない', async () => {
		const handler = createMessageHandler(timesAllChannelId, workspaceUrl);
		const message = {
			type: 'message',
			subtype: undefined,
			channel: 'C_GENERAL',
			channel_type: 'channel',
			text: 'hello',
			ts: '1234567890.123456',
			user: 'U12345',
		};
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args = makeArgs(message, 'general') as any;
		await handler(args);

		assert.equal(args.client.chat.postMessage.mock.callCount(), 0);
	});

	it('subtypeを持つメッセージは転送しない', async () => {
		const handler = createMessageHandler(timesAllChannelId, workspaceUrl);
		const message = {
			type: 'message',
			subtype: 'channel_join',
			channel: 'C_TIMES_YAMADA',
			channel_type: 'channel',
			ts: '1234567890.123456',
		};
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args = makeArgs(message) as any;
		await handler(args);

		assert.equal(args.client.conversations.info.mock.callCount(), 0);
		assert.equal(args.client.chat.postMessage.mock.callCount(), 0);
	});

	it('DMメッセージは転送しない', async () => {
		const handler = createMessageHandler(timesAllChannelId, workspaceUrl);
		const message = {
			type: 'message',
			subtype: undefined,
			channel: 'C_TIMES_YAMADA',
			channel_type: 'im',
			text: 'hello',
			ts: '1234567890.123456',
			user: 'U12345',
		};
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args = makeArgs(message) as any;
		await handler(args);

		assert.equal(args.client.conversations.info.mock.callCount(), 0);
		assert.equal(args.client.chat.postMessage.mock.callCount(), 0);
	});

	it('同一チャンネルの2回目以降はconversations.infoを呼ばない', async () => {
		const handler = createMessageHandler(timesAllChannelId, workspaceUrl);
		const message = {
			type: 'message',
			subtype: undefined,
			channel: 'C_CACHED',
			channel_type: 'channel',
			text: 'first',
			ts: '1234567890.000001',
			user: 'U12345',
		};
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args1 = makeArgs(message) as any;
		await handler(args1);

		const message2 = { ...message, text: 'second', ts: '1234567890.000002' };
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args2 = makeArgs(message2) as any;
		await handler(args2);

		assert.equal(args1.client.conversations.info.mock.callCount(), 1);
		assert.equal(args2.client.conversations.info.mock.callCount(), 0);
	});

	it('conversations.infoが例外をスローした場合は転送しない', async () => {
		const handler = createMessageHandler(timesAllChannelId, workspaceUrl);
		const message = {
			type: 'message',
			subtype: undefined,
			channel: 'C_ERROR',
			channel_type: 'channel',
			text: 'hello',
			ts: '1234567890.123456',
			user: 'U12345',
		};
		const args = {
			message,
			client: {
				conversations: {
					info: mock.fn(() => Promise.reject(new Error('platform_error'))),
				},
				chat: {
					postMessage: mock.fn(() => Promise.resolve()),
				},
			},
		};
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		await handler(args as any);

		assert.equal(args.client.chat.postMessage.mock.callCount(), 0);
	});
});
