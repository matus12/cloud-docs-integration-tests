require("dotenv").config();

export const TEST_API_KEY = process.env.OHP_TEST_CM_API_KEY || "";
export const TEST_PROJECT_ID = process.env.OHP_TEST_PROJECT_ID || "";
export const LIVE_API_KEY = process.env.OHP_LIVE_CM_API_KEY || "";
export const LIVE_PROJECT_ID = process.env.OHP_LIVE_PROJECT_ID || "";
