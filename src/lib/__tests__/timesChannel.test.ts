import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isTimesChannel } from '../timesChannel.ts';

describe('isTimesChannel', () => {
	it('times-で始まるチャンネル名にtrueを返す', () => {
		assert.equal(isTimesChannel('times-yamada'), true);
	});

	it('times-のみでもtrueを返す', () => {
		assert.equal(isTimesChannel('times-'), true);
	});

	it('times-で始まらないチャンネル名にfalseを返す', () => {
		assert.equal(isTimesChannel('general'), false);
	});

	it('timesだけではfalseを返す', () => {
		assert.equal(isTimesChannel('times'), false);
	});

	it('空文字にfalseを返す', () => {
		assert.equal(isTimesChannel(''), false);
	});
});
