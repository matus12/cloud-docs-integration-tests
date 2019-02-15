import {
    ContentManagementClient,
    IContentManagementClient,
} from "kentico-cloud-content-management";
import {
    LIVE_API_KEY,
    LIVE_PROJECT_ID,
    TEST_API_KEY,
    TEST_PROJECT_ID,
} from "../constants/projectSettings";

let testKenticoClient: IContentManagementClient;
let liveKenticoClient: IContentManagementClient;

export const getTestKenticoClient = () => {
    if (testKenticoClient === undefined) {
        testKenticoClient = new ContentManagementClient({
            apiKey: TEST_API_KEY,
            projectId: TEST_PROJECT_ID,
        });
    }

    return testKenticoClient;
};

export const getLiveKenticoClient = () => {
    if (liveKenticoClient === undefined) {
        liveKenticoClient = new ContentManagementClient({
            apiKey: LIVE_API_KEY,
            projectId: LIVE_PROJECT_ID,
        });
    }

    return liveKenticoClient;
};
