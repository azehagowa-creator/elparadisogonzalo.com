import openai from "./config/openai.config.js";

const models = await openai.models.list();

for (const model of models.data.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(model.id);
}
