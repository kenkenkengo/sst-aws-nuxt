import { APIGatewayEvent } from 'aws-lambda';
import { Resource } from "sst";

export const handler = async (
  event: APIGatewayEvent,
): Promise<{ isAuthorized: boolean; context?: any }> => {
  const originVerify = event.headers?.['x-origin-verify'];

  try {
    // リクエストのヘッダーに含まれるトークンと、シークレットマネージャーに保存されているトークンが一致しているかチェックする
    if (originVerify === Resource.VerifyToken.value) {
      return {
        isAuthorized: true,
        context: {
          user: 'user',
        },
      };
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
  }

  return {
    isAuthorized: false,
  };
};