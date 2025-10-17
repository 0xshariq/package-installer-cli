import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contractAddress = "DEPLOYED_CONTRACT_ADDRESS";
const abi = [
  "function set(uint256 _data) public",
  "function get() public view returns (uint256)"
];

const contract = new ethers.Contract(contractAddress, abi, provider);

async function readData() {
  const value = await contract.get();
  console.log("Stored value:", value.toString());
}

readData();
