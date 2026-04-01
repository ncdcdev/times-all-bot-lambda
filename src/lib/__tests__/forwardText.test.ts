import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildForwardText } from '../forwardText.ts';

describe('buildForwardText', () => {
	it('Slackのメッセージリンクとチャンネルメンションを含むテキストを構築する', () => {
		const result = buildForwardText(
			'https://workspace.slack.com/archives/C12345/p1234567890123456',
			'C12345',
		);
		assert.equal(
			result,
			'<https://workspace.slack.com/archives/C12345/p1234567890123456|このメッセージ> が <#C12345> で投稿されました。',
		);
	});
});
