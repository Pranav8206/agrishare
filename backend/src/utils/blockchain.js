import { ethers } from "ethers";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const RENTAL_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_equipmentId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_renterIdHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_bookingIdHash",
        type: "bytes32",
      },
      {
        internalType: "uint64",
        name: "_startTime",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "_endTime",
        type: "uint64",
      },
    ],
    name: "recordRental",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getRentalsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ENV_PATH = resolve(__dirname, "../../.env");

const loadBlockchainEnv = () => {
  dotenv.config({ path: ENV_PATH, override: true });
};

const sanitizeEnvValue = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

let provider = null;
let wallet = null;
let rentalContract = null;
let lastRpcUrl = "";
let lastPrivateKey = "";
let lastContractAddress = "";

export const getRentalContract = () => {
  loadBlockchainEnv();

  const rpcUrl = sanitizeEnvValue(process.env.RPC_URL);
  const privateKey = sanitizeEnvValue(process.env.PRIVATE_KEY);
  const rawContractAddress = sanitizeEnvValue(process.env.CONTRACT_ADDRESS);
  const contractAddress = rawContractAddress
    ? ethers.getAddress(rawContractAddress)
    : "";

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error(
      "Blockchain env missing. Required: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS"
    );
  }

  const providerChanged = !provider || rpcUrl !== lastRpcUrl;
  const walletChanged = !wallet || providerChanged || privateKey !== lastPrivateKey;
  const contractChanged =
    !rentalContract || walletChanged || contractAddress !== lastContractAddress;

  if (providerChanged) {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  if (walletChanged) {
    wallet = new ethers.Wallet(privateKey, provider);
  }

  if (contractChanged) {
    rentalContract = new ethers.Contract(contractAddress, RENTAL_ABI, wallet);
  }

  lastRpcUrl = rpcUrl;
  lastPrivateKey = privateKey;
  lastContractAddress = contractAddress;

  return rentalContract;
};

// Contract expects uint256 while equipment id is Mongo ObjectId string.
export const equipmentIdToUint256 = (equipmentId) => {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(String(equipmentId)));
  return BigInt(hash);
};

export const userIdToBytes32 = (userId) => {
  return ethers.keccak256(ethers.toUtf8Bytes(String(userId)));
};

export const bookingIdToBytes32 = (bookingId) => {
  return ethers.keccak256(ethers.toUtf8Bytes(String(bookingId)));
};

export const dateToUnixSeconds = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }
  return BigInt(Math.floor(date.getTime() / 1000));
};

export const recordRentalOnChain = async ({
  equipmentId,
  renterUserId,
  bookingId,
  startDate,
  endDate,
}) => {
  if (!renterUserId) {
    throw new Error("Missing renter user id");
  }

  if (!bookingId) {
    throw new Error("Missing booking id");
  }

  if (!startDate || !endDate) {
    throw new Error("Missing booking dates");
  }

  const contract = getRentalContract();
  const normalizedEquipmentId = equipmentIdToUint256(equipmentId);
  const renterIdHash = userIdToBytes32(renterUserId);
  const bookingIdHash = bookingIdToBytes32(bookingId);
  const startTime = dateToUnixSeconds(startDate);
  const endTime = dateToUnixSeconds(endDate);

  try {
    // Sanity-check configured contract matches AgriShare ABI before sending tx.
    await contract.getRentalsCount();

    const tx = await contract.recordRental(
      normalizedEquipmentId,
      renterIdHash,
      bookingIdHash,
      startTime,
      endTime
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    const contractAddress = sanitizeEnvValue(process.env.CONTRACT_ADDRESS);
    const fromAddress = wallet?.address;
    const reason = error?.shortMessage || error?.reason || error?.message;

    throw new Error(
      `recordRental failed on contract ${contractAddress} from ${fromAddress}. Reason: ${reason}`
    );
  }
};
