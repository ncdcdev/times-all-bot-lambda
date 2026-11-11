import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as runtime from 'aws-cdk-lib/aws-lambda';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import { nodeMajor } from '../../scripts/node-version.ts';
import { loadEnv } from '../../src/env.ts';

export class TimesAllBotStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const env = loadEnv();
		const nodeRuntime = runtime.Runtime.ALL.find(
			(candidate) => candidate.name === `nodejs${nodeMajor}.x`,
		);
		if (!nodeRuntime) {
			throw new Error(`AWS CDK does not support Node.js ${nodeMajor}`);
		}

		const projectRoot = path.join(import.meta.dirname, '../..');

		const fn = new lambda.NodejsFunction(this, 'SlackHandler', {
			entry: path.join(projectRoot, 'src/handler.ts'),
			handler: 'handler',
			runtime: nodeRuntime,
			timeout: cdk.Duration.seconds(30),
			environment: {
				SLACK_BOT_TOKEN: env.slackBotToken,
				SLACK_SIGNING_SECRET: env.slackSigningSecret,
				TIMES_ALL_CHANNEL_ID: env.timesAllChannelId,
				WORKSPACE_URL: env.workspaceUrl,
			},
			bundling: {
				nodeModules: ['@slack/bolt'],
				commandHooks: {
					beforeBundling(inputDir: string): string[] {
						return [`cd ${inputDir}`];
					},
					afterBundling(): string[] {
						return [];
					},
					beforeInstall(): string[] {
						return [];
					},
				},
			},
			depsLockFilePath: path.join(projectRoot, 'pnpm-lock.yaml'),
		});

		const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
			apiName: 'times-all-bot',
		});

		const integration = new integrations.HttpLambdaIntegration(
			'SlackIntegration',
			fn,
		);

		httpApi.addRoutes({
			path: '/slack/events',
			methods: [apigatewayv2.HttpMethod.POST],
			integration,
		});

		new cdk.CfnOutput(this, 'ApiEndpoint', {
			value: `${httpApi.apiEndpoint}/slack/events`,
			description: 'Slack Event Subscriptions Request URL',
		});

		// GitHub Actions OIDC
		const oidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidc', {
			url: 'https://token.actions.githubusercontent.com',
			clientIds: ['sts.amazonaws.com'],
		});

		const deployRole = new iam.Role(this, 'GitHubActionsDeployRole', {
			roleName: 'github-actions-times-all-bot',
			assumedBy: new iam.WebIdentityPrincipal(
				oidcProvider.openIdConnectProviderArn,
				{
					StringEquals: {
						'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
					},
					StringLike: {
						'token.actions.githubusercontent.com:sub':
							'repo:ncdcdev/times-all-bot-lambda:*',
					},
				},
			),
			inlinePolicies: {
				CdkDeploy: new iam.PolicyDocument({
					statements: [
						new iam.PolicyStatement({
							actions: ['sts:AssumeRole'],
							resources: [
								`arn:aws:iam::${this.account}:role/cdk-hnb659fds-*-${this.account}-${this.region}`,
							],
						}),
					],
				}),
			},
		});

		new cdk.CfnOutput(this, 'DeployRoleArn', {
			value: deployRole.roleArn,
			description: 'GitHub ActionsデプロイのIAMロールARN',
		});
	}
}
