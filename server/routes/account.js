import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getAccountInfo, getDeals } from "../services/metaApiService.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = express.Router();

/**
 * GET /api/account/info
 * Get account information, balance, equity, positions
 */
router.get("/info", authenticateToken, async (req, res, next) => {
  try {
    const { accountId } = req.user;
    const metaApiToken = process.env.METAAPI_TOKEN;

    if (!accountId) {
      throw new ApiError(400, "Account ID not found");
    }

    if (!metaApiToken) {
      throw new ApiError(500, "MetaAPI token not configured");
    }

    const accountData = await getAccountInfo(accountId, metaApiToken);
    const account = accountData.account;

    res.json({
      success: true,
      data: {
        account: {
          name: account.name || "MT4 Account",
          login: account.login || "",
          broker: account.broker || "",
          server: account.server || "",
          currency: account.currency || "USD",
          platform: account.platform || "MT4",
          region: account.region || "US",
        },
        balance: account.balance || 0,
        equity: account.equity || 0,
        margin: account.margin || 0,
        freeMargin: account.freeMargin || 0,
        marginLevel: account.marginLevel || 0,
        leverage: account.leverage || 0,
        positions: accountData.positions,
        orders: accountData.orders,
      },
    });
  } catch (error) {
    console.error("Account info error:", error);
    next(new ApiError(500, "Failed to fetch account information"));
  }
});

/**
 * GET /api/account/positions
 * Get open positions only
 */
router.get("/positions", authenticateToken, async (req, res, next) => {
  try {
    const { accountId } = req.user;
    const metaApiToken = process.env.METAAPI_TOKEN;

    if (!accountId) {
      throw new ApiError(400, "Account ID not found");
    }

    if (!metaApiToken) {
      throw new ApiError(500, "MetaAPI token not configured");
    }

    const accountData = await getAccountInfo(accountId, metaApiToken);

    res.json({
      success: true,
      data: accountData.positions || [],
    });
  } catch (error) {
    console.error("Positions error:", error);
    next(new ApiError(500, "Failed to fetch positions"));
  }
});

/**
 * GET /api/account/deals
 * Get deal history
 * Query params: startTime, endTime (timestamps)
 */
router.get("/deals", authenticateToken, async (req, res, next) => {
  try {
    const { accountId } = req.user;
    const metaApiToken = process.env.METAAPI_TOKEN;
    const { startTime, endTime, year } = req.query;

    if (!accountId) {
      throw new ApiError(400, "Account ID not found");
    }

    if (!metaApiToken) {
      throw new ApiError(500, "MetaAPI token not configured");
    }

    let start, end;

    if (year) {
      // If year is specified, fetch all deals for that year
      const yearNum = parseInt(year);
      start = new Date(yearNum, 0, 1); // January 1st of the year
      end = new Date(yearNum, 11, 31, 23, 59, 59, 999); // December 31st of the year
    } else if (startTime && endTime) {
      // Use provided time range
      end = new Date(parseInt(endTime));
      start = new Date(parseInt(startTime));
    } else {
      // Default to last year if not specified (to get all recent data)
      end = new Date();
      start = new Date(end.getFullYear() - 1, 0, 1); // January 1st of last year
    }

    const deals = await getDeals(accountId, start, end, metaApiToken);

    res.json({
      success: true,
      data: deals || [],
    });
  } catch (error) {
    console.error("Deals error:", error);
    next(new ApiError(500, "Failed to fetch deal history"));
  }
});

/**
 * GET /api/account/summary
 * Get comprehensive account summary with calculations
 */
router.get("/summary", authenticateToken, async (req, res, next) => {
  try {
    const { accountId } = req.user;
    const metaApiToken = process.env.METAAPI_TOKEN;

    if (!accountId) {
      throw new ApiError(400, "Account ID not found");
    }

    if (!metaApiToken) {
      throw new ApiError(500, "MetaAPI token not configured");
    }

    const accountData = await getAccountInfo(accountId, metaApiToken);
    const account = accountData.account;

    // Calculate metrics from positions
    const positions = accountData.positions || [];
    const totalProfit = positions.reduce(
      (sum, pos) => sum + (pos.profit || 0),
      0
    );
    const totalSwap = positions.reduce((sum, pos) => sum + (pos.swap || 0), 0);
    const totalCommission = positions.reduce(
      (sum, pos) => sum + (pos.commission || 0),
      0
    );

    // Get deals for statistics
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deals = await getDeals(accountId, start, end, metaApiToken);

    // Calculate win rate
    const closedTrades = deals.filter(
      (d) => d.type === "DEAL_TYPE_SELL" || d.type === "DEAL_TYPE_BUY"
    );
    const wonTrades = closedTrades.filter((d) => (d.profit || 0) > 0);
    const lostTrades = closedTrades.filter((d) => (d.profit || 0) < 0);
    const winRate =
      closedTrades.length > 0
        ? (wonTrades.length / closedTrades.length) * 100
        : 0;

    res.json({
      success: true,
      data: {
        balance: account.balance || 0,
        equity: account.equity || 0,
        margin: account.margin || 0,
        freeMargin: account.freeMargin || 0,
        marginLevel: account.marginLevel || 0,
        leverage: account.leverage || 0,
        totalProfit,
        totalSwap,
        totalCommission,
        openPositions: positions.length,
        winRate: parseFloat(winRate.toFixed(2)),
        won: wonTrades.length,
        lost: lostTrades.length,
        total: closedTrades.length,
      },
    });
  } catch (error) {
    console.error("Summary error:", error);
    next(new ApiError(500, "Failed to fetch account summary"));
  }
});

export default router;
