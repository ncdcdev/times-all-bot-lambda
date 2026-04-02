import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AllMessageEvents, GenericMessageEvent } from '@slack/types';
import { isForwardableMessage } from '../messageFilter.ts';

describe('isForwardableMessage', () => {
	const timesAllChannelId = 'C_TIMES_ALL';

	const baseMessage: GenericMessageEvent = {
		type: 'message',
		subtype: undefined,
		channel: 'C_OTHER',
		channel_type: 'channel',
		text: 'hello',
		ts: '1234567890.123456',
		user: 'U12345',
	} as GenericMessageEvent;

	it('通常のチャンネルメッセージはtrueを返す', () => {
		assert.equal(isForwardableMessage(baseMessage, timesAllChannelId), true);
	});

	it('times-allチャンネルのメッセージはfalseを返す', () => {
		const message = { ...baseMessage, channel: timesAllChannelId };
		assert.equal(isForwardableMessage(message, timesAllChannelId), false);
	});

	it('DMメッセージはfalseを返す', () => {
		const message = { ...baseMessage, channel_type: 'im' as const };
		assert.equal(isForwardableMessage(message, timesAllChannelId), false);
	});

	it('転送対象外のsubtypeはfalseを返す (channel_join)', () => {
		const message = {
			type: 'message',
			subtype: 'channel_join',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
		} as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), false);
	});

	it('転送対象外のsubtypeはfalseを返す (bot_message)', () => {
		const message = {
			type: 'message',
			subtype: 'bot_message',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
		} as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), false);
	});

	it('転送対象外のsubtypeはfalseを返す (message_changed)', () => {
		const message = {
			type: 'message',
			subtype: 'message_changed',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
			hidden: true,
		} as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), false);
	});

	it('file_shareは転送対象としてtrueを返す', () => {
		const message = {
			type: 'message',
			subtype: 'file_share',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
		} as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), true);
	});

	it('me_messageは転送対象としてtrueを返す', () => {
		const message = {
			type: 'message',
			subtype: 'me_message',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
		} as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), true);
	});

	it('thread_broadcastは転送対象としてtrueを返す', () => {
		const message = {
			type: 'message',
			subtype: 'thread_broadcast',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
		} as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), true);
	});

	it('未知のsubtypeは転送対象外としてfalseを返す', () => {
		const message = {
			type: 'message',
			subtype: 'some_unknown_subtype',
			channel: 'C_OTHER',
			channel_type: 'channel',
			ts: '1234567890.123456',
		} as unknown as AllMessageEvents;
		assert.equal(isForwardableMessage(message, timesAllChannelId), false);
	});
});
