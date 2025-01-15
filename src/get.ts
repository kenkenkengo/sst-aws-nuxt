import { CodeContent } from "./lib/entity";
import { Resource } from "sst";

export async function handler() {
  console.log('secret', Resource.VerifyToken.value);

  const data = await CodeContent.get({
    code: "1",
  }).go();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}