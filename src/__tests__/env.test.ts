import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as v from 'valibot';
import { loadEnv } from '../env.ts';

describe('loadEnv', () => {
	const validEnv = {
		SLACK_SIGNING_SECRET: 'secret',
		SLACK_BOT_TOKEN: 'xoxb-token',
		TIMES_ALL_CHANNEL_ID: 'C12345',
		WORKSPACE_URL: 'https://workspace.slack.com',
	};

	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		originalEnv = { ...process.env };
		for (const [key, value] of Object.entries(validEnv)) {
			process.env[key] = value;
		}
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it('すべての環境変数が設定されている場合はEnvオブジェクトを返す', () => {
		const env = loadEnv();
		assert.deepEqual(env, {
			slackSigningSecret: 'secret',
			slackBotToken: 'xoxb-token',
			timesAllChannelId: 'C12345',
			workspaceUrl: 'https://workspace.slack.com',
		});
	});

	it('SLACK_SIGNING_SECRETが未設定の場合はValiErrorを投げる', () => {
		delete process.env['SLACK_SIGNING_SECRET'];
		assert.throws(() => loadEnv(), v.ValiError);
	});

	it('SLACK_BOT_TOKENが未設定の場合はValiErrorを投げる', () => {
		delete process.env['SLACK_BOT_TOKEN'];
		assert.throws(() => loadEnv(), v.ValiError);
	});

	it('TIMES_ALL_CHANNEL_IDが未設定の場合はValiErrorを投げる', () => {
		delete process.env['TIMES_ALL_CHANNEL_ID'];
		assert.throws(() => loadEnv(), v.ValiError);
	});

	it('WORKSPACE_URLが未設定の場合はValiErrorを投げる', () => {
		delete process.env['WORKSPACE_URL'];
		assert.throws(() => loadEnv(), v.ValiError);
	});

	it('WORKSPACE_URLが不正なURLの場合はValiErrorを投げる', () => {
		process.env['WORKSPACE_URL'] = 'not-a-url';
		assert.throws(() => loadEnv(), v.ValiError);
	});
});
