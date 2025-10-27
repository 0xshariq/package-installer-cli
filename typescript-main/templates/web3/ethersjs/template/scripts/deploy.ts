import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY_HERE", provider);

const contractPath = path.resolve("artifacts/contracts/SimpleStorage.sol/SimpleStorage.json");
const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));

async function main() {
  const factory = new ethers.ContractFactory(contractJSON.abi, contractJSON.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", contract.target);
}

main().catch(console.error);
