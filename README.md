# time-all-bot
repost times-* channel to "time-all"

元リポジトリは
https://github.com/ratmie/time-all-bot

## setting

.envファイルを作成する
```
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET= 
TIMES_ALL_CHANNEL_ID=
WORKSPACE_URL=
```

## deploy

mainブランチにpushすると、GitHub Actionsで自動デプロイされる。

インフラはAWS CDKで管理しており、定義は`infra/`ディレクトリにある。

## 資料

boltのドキュメント
https://slack.dev/bolt-js/ja-jp/deployments/aws-lambda
