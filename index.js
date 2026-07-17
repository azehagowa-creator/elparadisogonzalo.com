import openai, { DEFAULT_MODEL } from "./config/openai.config.js";

async function main() {
  try {
    console.log("======================================");
    console.log("Elparadisogonzalo OpenAI SDK");
    console.log("======================================");
    console.log(`Model: ${DEFAULT_MODEL}`);
    console.log();

    const response = await openai.responses.create({
      model: DEFAULT_MODEL,
      input: "Hello from Elparadisogonzalo!",
    });

    console.log("AI Response:");
    console.log("--------------------------------------");
    console.log(response.output_text);
    console.log("--------------------------------------");
  } catch (error) {
    console.error("OpenAI Error:");
    console.error(error);
  }
}

main();
