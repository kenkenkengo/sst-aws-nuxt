# sst

sst とは、サーバーレス含むフルスタック・アプリケーションを簡単に構築できるフレームワークです。

https://sst.dev/docs/

本レポジトリは Nuxt 3 のサンプルとなりますが、Vite などの静的サイトも同様に構築できます。

## secret

環境毎に secret を管理します。
sst では、.env による管理は推奨されていません。sst secret コマンドを利用します。

https://sst.dev/docs/environment-variables/#_top

### 作成

```
<!-- local環境 -->
AWS_PROFILE={{profile名}} npx sst secret set <name> [value]
<!-- dev環境 -->
AWS_PROFILE={{profile名}} npx sst secret set <name> [value] --stage dev
```

### 確認

```
<!-- local環境 -->
AWS_PROFILE={{profile名}} npx sst secret list
<!-- dev環境 -->
AWS_PROFILE={{profile名}} npx sst secret list --stage dev
```

### 削除

```
<!-- local環境 -->
AWS_PROFILE={{profile名}} npx sst secret remove <name>
<!-- dev環境 -->
AWS_PROFILE={{profile名}} npx sst secret remove <name> --stage dev
```

## local development

```
AWS_PROFILE={{profile名}} npx sst dev
```

AWS 管理画面を開き、開発用 API Gateway の Route にアタッチされている Lambda Authorizer を デタッチしてから開発します。

## deploy

```
AWS_PROFILE={{profile名}} npx sst deploy --stage dev
```

## CI/CD

GitHub Actions で sst deploy を実行します。

事前準備として、Assume Role するための IAM ロールの作成を行ってください。
また、GitHub Actions の環境作成（prod, stage, dev）・シークレット（AWS_ACCOUNT_ID, ASSUME_ROLE_NAME） の登録も行ってください。
ブランチの運用は main, stage, dev とします。

参考：
https://qiita.com/generoKoki/items/bcf87549a18a1481d62e
