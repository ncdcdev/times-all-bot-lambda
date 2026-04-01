import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as runtime from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';
import * as path from 'path';

export class TimesAllBotStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const slackBotToken = process.env.SLACK_BOT_TOKEN;
		if (!slackBotToken) throw new Error('SLACK_BOT_TOKEN is required');
		const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
		if (!slackSigningSecret) throw new Error('SLACK_SIGNING_SECRET is required');
		const timesAllChannelId = process.env.TIMES_ALL_CHANNEL_ID;
		if (!timesAllChannelId) throw new Error('TIMES_ALL_CHANNEL_ID is required');
		const workspaceUrl = process.env.WORKSPACE_URL;
		if (!workspaceUrl) throw new Error('WORKSPACE_URL is required');

		const projectRoot = path.join(__dirname, '../..');

		const fn = new lambda.NodejsFunction(this, 'SlackHandler', {
			entry: path.join(projectRoot, 'index.ts'),
			handler: 'handler',
			runtime: runtime.Runtime.NODEJS_20_X,
			timeout: cdk.Duration.seconds(30),
			environment: {
				SLACK_BOT_TOKEN: slackBotToken,
				SLACK_SIGNING_SECRET: slackSigningSecret,
				TIMES_ALL_CHANNEL_ID: timesAllChannelId,
				WORKSPACE_URL: workspaceUrl,
			},
			bundling: {
				nodeModules: ['@slack/bolt', 'dotenv'],
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
			depsLockFilePath: path.join(projectRoot, 'package-lock.json'),
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
