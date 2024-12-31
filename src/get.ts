import { Resource } from "sst";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export async function handler() {
  console.log(process.env.DEBUG, "get");
  console.log("verifyToken", Resource.VerifyToken.value);

  const client = new DynamoDBClient();

  const data = await client.send(new GetItemCommand({
    TableName: Resource.MyTable.name,
    Key: { code: { S: "1" } },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(data.Item),
  };
}