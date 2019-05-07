require("dotenv").config();

export const TEST_API_KEY = process.env.OHP_TEST_CM_API_KEY || "";
export const TEST_PROJECT_ID = process.env.OHP_TEST_PROJECT_ID || "";
export const LIVE_API_KEY = process.env.OHP_LIVE_CM_API_KEY || "";
export const LIVE_PROJECT_ID = process.env.OHP_LIVE_PROJECT_ID || "";

export const TEST_SECURED_API_KEY = process.env.OHP_TEST_SECURED_API_KEY || "";

export const CASCADE_PUBLISH_ID = process.env.KC_STEP_CASCADE_PUBLISH_ID || "";
export const PUBLISHED_ID = process.env.KC_STEP_PUBLISHED_ID || "";
export const PUBLISHER_TRIGGER_URL = process.env.PUBLISHER_TRIGGER_URL || "";

export const SEARCH_APP_ID = process.env.OHP_SEARCH_APP_ID || "";
export const SEARCH_API_KEY = process.env.OHP_SEARCH_API_KEY || "";
export const SEARCH_INDEX_NAME = process.env.OHP_SEARCH_INDEX_NAME || "";

export const WEB_URL = process.env.WEB_URL || "";

export const getWebUrl = () =>
    `${WEB_URL}?projectid=${TEST_PROJECT_ID}&securedapikey=${TEST_SECURED_API_KEY}` +
    `&searchappid=${SEARCH_APP_ID}&searchapikey=${SEARCH_API_KEY}&searchindexname=${SEARCH_INDEX_NAME}`;
