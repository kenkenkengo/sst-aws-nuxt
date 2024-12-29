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
npx sst secret set <name> [value] --stage dev
```

### 確認

```
npx sst secret list --stage dev
```

### 削除

```
npx sst secret remove <name> --stage dev
```

## deploy

AWS の profile は sst.config.ts の設定により、stage に応じて切り替えられます。

```
npx sst deploy --stage dev
```
