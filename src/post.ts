import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export async function handler() {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient());

  await client.send(new PutCommand({
    TableName: Resource.MyTable.name,
    Item: {
      code: "1",
    },
  }));

  return {
    statusCode: 200,
    body: "POST success",
  };
}