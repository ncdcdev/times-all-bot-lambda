import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { handleChannelCreated } from '../channelCreated.ts';

describe('handleChannelCreated', () => {
	function makeArgs(channelName: string, channelId: string) {
		return {
			event: {
				channel: { name: channelName, id: channelId },
			},
			client: {
				conversations: {
					join: mock.fn(() => Promise.resolve()),
				},
			},
			logger: {
				debug: mock.fn(),
				info: mock.fn(),
			},
		};
	}

	it('times-で始まるチャンネルにjoinする', async () => {
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args = makeArgs('times-yamada', 'C12345') as any;
		await handleChannelCreated(args);

		assert.equal(args.client.conversations.join.mock.callCount(), 1);
		assert.deepEqual(
			args.client.conversations.join.mock.calls[0].arguments[0],
			{ channel: 'C12345' },
		);
	});

	it('times-以外のチャンネルにはjoinしない', async () => {
		// biome-ignore lint/suspicious/noExplicitAny: テスト用のモック
		const args = makeArgs('general', 'C12345') as any;
		await handleChannelCreated(args);

		assert.equal(args.client.conversations.join.mock.callCount(), 0);
	});
});
