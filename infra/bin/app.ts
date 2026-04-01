#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TimesAllBotStack } from '../lib/times-all-bot-stack.js';

const app = new cdk.App();
new TimesAllBotStack(app, 'TimesAllBotStack', {
	env: {
		region: 'ap-northeast-1',
	},
});
