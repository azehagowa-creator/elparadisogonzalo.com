const fs = require("fs");
const path = require("path");

const contractJson = require("../artifacts/contracts/YourContract.sol/YourContract.json");
const outDir = path.join(__dirname, "../packages/frontend/src/contracts");

fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, "YourContract.json"),
  JSON.stringify(contractJson.abi, null, 2)
);

fs.writeFileSync(
  path.join(outDir, "contract-address.json"),
  JSON.stringify({ address: "0x4e8c73e7f243d12b7a5571200609523a4890beff" }, null, 2)
);

console.log("✅ Synced ABI and contract address to frontend.");
