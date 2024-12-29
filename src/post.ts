import { Resource } from "sst";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export async function handler() {
  const client = new DynamoDBClient();

  await client.send(new PutItemCommand({
    TableName: Resource.MyTable.name,
    Item: {
      code: { S: "1" },
    },
  }));

  return {
    statusCode: 200,
    body: "POST success",
  };
}