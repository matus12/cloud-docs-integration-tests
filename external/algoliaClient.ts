import algoliasearch from "algoliasearch";
import {
    SEARCH_API_KEY,
    SEARCH_APP_ID,
    SEARCH_INDEX_NAME,
} from "../shared/projectSettings";

const algoliaClient = algoliasearch(SEARCH_APP_ID, SEARCH_API_KEY);

export const algoliaIndex = algoliaClient.initIndex(SEARCH_INDEX_NAME);
