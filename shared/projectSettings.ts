require("dotenv").config();

export const TEST_API_KEY = process.env.OHP_TEST_CM_API_KEY || "";
export const TEST_PROJECT_ID = process.env.OHP_TEST_PROJECT_ID || "";
export const LIVE_API_KEY = process.env.OHP_LIVE_CM_API_KEY || "";
export const LIVE_PROJECT_ID = process.env.OHP_LIVE_PROJECT_ID || "";
export const SEARCH_APP_ID = process.env.OHP_SEARCH_APP_ID || "";
export const SEARCH_API_KEY = process.env.OHP_SEARCH_API_KEY || "";
export const SEARCH_INDEX_NAME = process.env.OHP_SEARCH_INDEX_NAME || "";
export const CASCADE_PUBLISH_ID = process.env.KC_STEP_CASCADE_PUBLISH_ID || "";
export const PUBLISHER_TRIGGER_URL = process.env.PUBLISHER_TRIGGER_URL || "";
