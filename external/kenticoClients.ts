import {
    ContentManagementClient,
    IContentManagementClient,
    IContentManagementClientConfig,
} from "kentico-cloud-content-management";
import { LIVE_API_KEY, LIVE_PROJECT_ID, TEST_API_KEY, TEST_PROJECT_ID } from "../shared/projectSettings";

let testKenticoClient: IContentManagementClient;
let liveKenticoClient: IContentManagementClient;

export const getTestKenticoClient = () => {
    if (testKenticoClient === undefined) {
        testKenticoClient = new ContentManagementClient(
            getContentManagementClientConfig(TEST_API_KEY, TEST_PROJECT_ID),
        );
    }

    return testKenticoClient;
};

export const getLiveKenticoClient = () => {
    if (liveKenticoClient === undefined) {
        liveKenticoClient = new ContentManagementClient(
            getContentManagementClientConfig(LIVE_API_KEY, LIVE_PROJECT_ID),
        );
    }

    return liveKenticoClient;
};

const getContentManagementClientConfig = (apiKey: string, projectId: string): IContentManagementClientConfig => ({
    apiKey,
    projectId,
    retryAttempts: 5,
    retryStatusCodes: [500, 503],
});
