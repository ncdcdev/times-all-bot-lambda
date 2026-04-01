import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildMessageLink } from '../messageLink.ts';

describe('buildMessageLink', () => {
	it('タイムスタンプのドットを除去してSlackのメッセージリンクを構築する', () => {
		const result = buildMessageLink(
			'https://workspace.slack.com',
			'C12345',
			'1234567890.123456',
		);
		assert.equal(
			result,
			'https://workspace.slack.com/archives/C12345/p1234567890123456',
		);
	});

	it('ドットのないタイムスタンプでも動作する', () => {
		const result = buildMessageLink(
			'https://workspace.slack.com',
			'C12345',
			'1234567890123456',
		);
		assert.equal(
			result,
			'https://workspace.slack.com/archives/C12345/p1234567890123456',
		);
	});
});
