import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSlackRetryDueToTimeout } from '../slackRetry.ts';

describe('isSlackRetryDueToTimeout', () => {
	it('http_timeoutのリトライの場合はtrueを返す', () => {
		const headers = {
			'x-slack-retry-num': '1',
			'x-slack-retry-reason': 'http_timeout',
		};
		assert.equal(isSlackRetryDueToTimeout(headers), true);
	});

	it('http_timeout以外のリトライの場合はfalseを返す', () => {
		const headers = {
			'x-slack-retry-num': '1',
			'x-slack-retry-reason': 'http_error',
		};
		assert.equal(isSlackRetryDueToTimeout(headers), false);
	});

	it('x-slack-retry-numヘッダーがない場合はfalseを返す', () => {
		const headers = {
			'content-type': 'application/json',
		};
		assert.equal(isSlackRetryDueToTimeout(headers), false);
	});
});
