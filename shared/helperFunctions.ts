import axios from "axios";
import {
    ContentItemModels,
    LanguageVariantModels,
} from "kentico-cloud-content-management";
import { getTestKenticoClient } from "../external/kenticoClients";
import {
    TEST_API_KEY,
    TEST_PROJECT_ID,
} from "./projectSettings";

const cmApiBaseAddress = `https://manage.kenticocloud.com/v2/projects/${TEST_PROJECT_ID}`;

export const publishDefaultLanguageVariant = async (itemId: string) => {
    return axios({
        headers: { Authorization: "Bearer " + TEST_API_KEY },
        method: "put",
        url: `${cmApiBaseAddress}/items/${itemId}/variants/00000000-0000-0000-0000-000000000000/publish`,
    });
};

export const unpublishDefaultLanguageVariant = async (itemId: string) => {
    return axios({
        headers: { Authorization: "Bearer " + TEST_API_KEY },
        method: "put",
        url: `${cmApiBaseAddress}/items/${itemId}/variants/00000000-0000-0000-0000-000000000000/unpublish`,
    });
};

export const createNewVersionOfDefaultLanguageVariant = async (itemId: string) => {
    return axios({
        headers: { Authorization: "Bearer " + TEST_API_KEY },
        method: "put",
        url: `${cmApiBaseAddress}/items/${itemId}/variants/00000000-0000-0000-0000-000000000000/new-version`,
    });
};

export const addContentItem = async (name: string, type: string): Promise<ContentItemModels.ContentItem> => {
    const response = await getTestKenticoClient()
        .addContentItem()
        .withData(
            {
                name,
                type: {
                    codename: type,
                },
            })
        .toPromise();

    return response.data;
};

export const upsertDefaultLanguageVariant = async (
    itemId: string,
    elements: LanguageVariantModels.ILanguageVariantElement[],
): Promise<LanguageVariantModels.ContentItemLanguageVariant> => {
    const response = await getTestKenticoClient()
        .upsertLanguageVariant()
        .byInternalId(itemId)
        .forLanguageId("00000000-0000-0000-0000-000000000000")
        .withElements(elements)
        .toPromise();

    return response.data;
};
