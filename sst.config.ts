/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "aws-nuxt",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          // 環境毎にプロファイルを切り替える
          profile: (() => {
            switch (input?.stage) {
              case "prod":
                return "jyp-mirrorsnap-pro-prod";
              case "stage":
                return "jyp-mirrorsnap-pro-stage";
              case "dev":
                return "jyp-mirrorsnap-pro-stage";
              default:
                throw new Error(`Unknown stage: ${input.stage}`);
            }
          })()
        }
      }
    };
  },
  async run() {
    const domainSecret = new sst.Secret("Domain");
    const passwordSecret = new sst.Secret("TestPassword");
    // basic auth
    // const username = new sst.Secret("BasicAuthUserName");
    // const password = new sst.Secret("BasicAuthPassword");

    // const basicAuth = $resolve([username.value, password.value]).apply(
    //   ([username, password]) =>
    //     Buffer.from(`${username}:${password}`).toString("base64")
    // );

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
      // server: {
      //   edge: {
      //     viewerRequest: {
      //       injection: $interpolate`
      //         // basic auth
      //         if (
      //           !event.request.headers.authorization
      //             || event.request.headers.authorization.value !== "Basic ${basicAuth}"
      //         ) {
      //           return {
      //             statusCode: 401,
      //             headers: {
      //               "www-authenticate": { value: "Basic" }
      //             }
      //           };
      //         }

      //         // spa routing
      //         if (event.request.method === "GET" && event.request.uri.indexOf(".") === -1) {
      //           event.request.uri = '/' + indexPage;
      //         }

      //         return event.request;
      //       }`,
      //     }
      //   }
      // }
    });

    const api = new sst.aws.ApiGatewayV2("MyApi", {
      // cors: {
      //   allowOrigins: [domainSecret.value, "http://localhost:3000"]
      // }
    });

    const table = new sst.aws.Dynamo("MyTable", {
      fields: {
        code: "string"
      },
      primaryIndex: { hashKey: "code" }
    });

    api.route("GET /", {
      handler: "src/get.handler",
      architecture: "arm64", // x86 よりもコスト安い
      link: [table, passwordSecret],
      environment: {
        DEBUG: "true",
      },
      logging: {
        format: "json",
      },
    });

    api.route("POST /", {
      handler: "src/post.handler",
      architecture: "arm64", // x86 よりもコスト安い
      link: [table],
      logging: {
        format: "json",
      },
    });
  },
});
