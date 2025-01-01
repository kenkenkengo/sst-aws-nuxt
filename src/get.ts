import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

export async function handler() {
  console.log(process.env.DEBUG, "get");
  console.log("verifyToken", Resource.VerifyToken.value);

  const client = DynamoDBDocumentClient.from(new DynamoDBClient());

  const data = await client.send(new GetCommand({
    TableName: Resource.MyTable.name,
    Key: { code: "1" },
  }));

  return {
    statusCode: 200,
      body: JSON.stringify(data.Item),
  };
}