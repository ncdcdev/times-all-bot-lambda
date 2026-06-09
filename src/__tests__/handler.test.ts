import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSlackRetry } from '../lib/slackRetry.ts';

describe('isSlackRetry', () => {
	it('x-slack-retry-numヘッダーがある場合はtrueを返す', () => {
		const headers = {
			'x-slack-retry-num': '1',
			'x-slack-retry-reason': 'http_timeout',
		};
		assert.equal(isSlackRetry(headers), true);
	});

	it('x-slack-retry-numヘッダーがない場合はfalseを返す', () => {
		const headers = {
			'content-type': 'application/json',
		};
		assert.equal(isSlackRetry(headers), false);
	});

	it('headersがundefinedの場合はfalseを返す', () => {
		assert.equal(isSlackRetry(undefined), false);
	});
});
