// Import MetaApi SDK using createRequire for CommonJS compatibility in ES modules
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Use require().default as shown in the official example
const MetaApi = require("metaapi.cloud-sdk").default;

// Store instances per token
const metaApiInstances = new Map();

export const getMetaApiClient = (token) => {
  if (!token) {
    throw new Error("MetaAPI token is required");
  }

  if (!metaApiInstances.has(token)) {
    metaApiInstances.set(token, new MetaApi(token));
  }

  return metaApiInstances.get(token);
};

export const getAccountConnection = async (accountId, token) => {
  try {
    if (!accountId) {
      throw new Error("Account ID is required");
    }

    if (!token) {
      throw new Error("MetaAPI token is required");
    }

    const metaApi = getMetaApiClient(token);
    const account = await metaApi.metatraderAccountApi.getAccount(accountId);

    const initialState = account.state;
    const deployedStates = ["DEPLOYING", "DEPLOYED"];

    // Deploy account if not already deployed
    if (!deployedStates.includes(initialState)) {
      console.log("Deploying account");
      await account.deploy();
    }

    // Wait for account to connect to broker
    console.log("Waiting for API server to connect to broker");
    await account.waitConnected();

    // Connect to MetaApi using RPC connection (as per example)
    const connection = account.getRPCConnection();
    await connection.connect();

    // Wait until terminal state synchronized
    console.log("Waiting for SDK to synchronize to terminal state");
    await connection.waitSynchronized();

    return connection;
  } catch (error) {
    console.error("MetaApi connection error:", error);
    throw error;
  }
};

export const getAccountInfo = async (accountId, token) => {
  try {
    const connection = await getAccountConnection(accountId, token);

    // Use RPC methods instead of properties (as per example)
    const accountInformation = await connection.getAccountInformation();
    const positions = await connection.getPositions();
    const orders = await connection.getOrders();

    return {
      account: accountInformation,
      positions: positions || [],
      orders: orders || [],
    };
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw error;
  }
};

export const getDeals = async (accountId, startTime, endTime, token) => {
  try {
    const connection = await getAccountConnection(accountId, token);

    // Use RPC method to get deals by time range (as per example)
    const deals = await connection.getDealsByTimeRange(startTime, endTime);

    return deals || [];
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw error;
  }
};
