import express from "express";
import { getTools } from "./tools.js";

export function createServer() {
  const app = express();

  app.use(express.json());

  app.use(express.static("public"));

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Elparadisogonzalo MCP Server"
    });
  });

  app.get("/mcp", (req, res) => {
    res.json({
      protocol: "Model Context Protocol",
      server: "Elparadisogonzalo",
      version: "1.0.0",
      tools: getTools()
    });
  });

  app.post("/mcp", (req, res) => {
    res.json({
      success: true,
      request: req.body
    });
  });

  return app;
}
