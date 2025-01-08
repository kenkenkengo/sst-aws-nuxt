import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Entity } from "electrodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const table = Resource.MyTable.name;

export const CodeContent = new Entity(
  {
    model: {
      entity: "codeContent",
      version: "1",
      service: "Content",
    },
    attributes: {
      code: { type: "string", required: true },
    },
    indexes: {
      byCode: {
        pk: {
          field: "pk",
          composite: ["code"],
        },
      },
    },
  },
  { client, table }
);