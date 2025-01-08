import { CodeContent } from "./lib/entity";

export async function handler() {
  const data = await CodeContent.get({
    code: "3",
  }).go();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}