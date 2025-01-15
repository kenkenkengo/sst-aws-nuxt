import { CodeContent } from "./lib/entity";

export async function handler() {
  await CodeContent.create({
    code: "1",
  }).go();

  return {
    statusCode: 200,
    body: "POST success",
  };
}