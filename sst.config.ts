/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "aws-nuxt",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const domainSecret = new sst.Secret("Domain");
    const verifyTokenSecret = new sst.Secret("VerifyToken");
    const username = new sst.Secret("BasicAuthUserName");
    const password = new sst.Secret("BasicAuthPassword");

    const basicAuth = $resolve([username.value, password.value]).apply(
      ([username, password]) =>
        Buffer.from(`${username}:${password}`).toString("base64")
    );

    // DynamoDB Settings
    const table = new sst.aws.Dynamo("MyTable", {
      fields: {
        pk: "string",
      },
      primaryIndex: { hashKey: "pk" },
      globalIndexes: {
        byCode: { hashKey: "pk" }
      }
    });

    // 開発時は全てのドメインを許可する
    const allowOrigins = $dev === true ? "*" : $resolve(domainSecret.value).apply(domain => `https://${domain}`)

    // API Gateway Settings
    const api = new sst.aws.ApiGatewayV2("MyApi", {
      cors: {
        allowOrigins: [
          allowOrigins
        ]
      }
    });

    // 認可
    const lambdaAuthorizer = api.addAuthorizer({
      name: "lambdaAuthorizer",
      lambda: {
        function: {
          handler: "src/authorizer.handler",
          architecture: "arm64", // x86 よりもコスト安い
          link: [verifyTokenSecret],
          logging: {
            format: "json",
          },
        },
        identitySources: ["$request.header.x-origin-verify"],
      },
    });

    // Lambda Authorizer の認証設定
    const authConfig = $dev === true ? {} : {
      auth: {
        lambda: lambdaAuthorizer.id,
      }
    };

    // API Route
    api.route("GET /api/get",
      {
        handler: "src/get.handler",
        architecture: "arm64",
        link: [table, verifyTokenSecret],
        environment: {
          DEBUG: "true",
        },
        logging: {
          format: "json",
        },
      },
      authConfig
    );

    api.route("POST /api/post",
      {
        handler: "src/post.handler",
        architecture: "arm64",
        link: [table],
        logging: {
          format: "json",
        },
      },
      authConfig
    );


    // CloudFront Settings
    const origin = {
      domainName: $resolve(api.url).apply(url => new URL(url).host), // https://の除去を行い、ドメインのみ抽出する
      originId: "apiOrigin", // オリジン名になる
      customOriginConfig: {
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ["TLSv1.2"],
        originProtocolPolicy: "https-only",
      },
      customHeaders: [{
        name: "x-origin-verify",
        value: verifyTokenSecret.value,
      }],
    };

    const cacheBehavior = {
      pathPattern: "/api/*",
      targetOriginId: origin.originId,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // CachingDisabled
      originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac", // AllViewerExceptHostHeader
    };


    // Static Site Settings
    new sst.aws.StaticSite("MyWeb", {
      domain: {
        name: domainSecret.value
      },
      invalidation: {
        wait: true
      },
      // Nuxt 3の静的build用。Viteではこのオプションは不要
      build: {
        command: "npm run generate",
        output: ".output/public"
      },
      transform: {
        cdn: (options: sst.aws.CdnArgs) => {
          options.origins = $resolve(options.origins).apply(val => [...val, origin]);

          options.orderedCacheBehaviors = $resolve(
            options.orderedCacheBehaviors || []
          ).apply(val => [...val, cacheBehavior]);
        },
      },
      edge: {
        viewerRequest: {
          injection: $interpolate`
            // basic auth
            if (
              !event.request.headers.authorization
                || event.request.headers.authorization.value !== "Basic ${basicAuth}"
            ) {
              return {
                statusCode: 401,
                headers: {
                  "www-authenticate": { value: "Basic" }
                }
              };
            }
          `
        }
      },
    });
  },
});
