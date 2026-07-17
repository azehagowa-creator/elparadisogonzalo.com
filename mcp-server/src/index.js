import { createServer } from "./server.js";

const PORT = process.env.PORT || 3000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`✅ MCP Server running`);
  console.log(`http://localhost:${PORT}/mcp`);
});
