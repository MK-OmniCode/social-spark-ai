import { createServerFn } from "@tanstack/react-start";
import { GenerateInput } from "./content-types";

export const generateWeek = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }) => {
    const { runGeneration } = await import("./content.server");
    return runGeneration(data);
  });
