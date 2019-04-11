import {
    ContentItemModels,
    LanguageVariantModels,
} from "kentico-cloud-content-management";
import { getTestKenticoClient } from "../external/kenticoClients";

const EmptyGuid: string = "00000000-0000-0000-0000-000000000000";

export const publishDefaultLanguageVariant = async (itemId: string): Promise<void> => {
    await getTestKenticoClient()
        .publishOrScheduleLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(EmptyGuid)
        .toPromise();
};

export const unpublishDefaultLanguageVariant = async (itemId: string): Promise<void> => {
    await getTestKenticoClient()
        .unpublishLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(EmptyGuid)
        .toPromise();
};

export const createNewVersionOfDefaultLanguageVariant = async (itemId: string): Promise<void> => {
    await getTestKenticoClient()
        .createNewVersionOfLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(EmptyGuid)
        .toPromise();
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
        .byItemId(itemId)
        .byLanguageId(EmptyGuid)
        .withElements(elements)
        .toPromise();

    return response.data;
};
