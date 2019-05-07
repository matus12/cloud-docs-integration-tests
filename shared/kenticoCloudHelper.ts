import {
    ContentItemModels,
    LanguageVariantModels,
} from "kentico-cloud-content-management";
import { getTestKenticoClient } from "../external/kenticoClients";
import { CASCADE_PUBLISH_ID } from "./projectSettings";

const EmptyGuid: string = "00000000-0000-0000-0000-000000000000";

export const publishDefaultLanguageVariant = async (itemId: string, scheduled_to?: string): Promise<void> => {
    const timeData = scheduled_to
        ? ({ scheduled_to })
        : undefined as any;

    await getTestKenticoClient()
        .publishOrScheduleLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(EmptyGuid)
        .withData(timeData)
        .toPromise();
};

export const scheduleDefaultLanguageVariant = async (itemId: string): Promise<void> => {
    let date = new Date();
    date.setMinutes(date.getMinutes() + 2);
    const scheduled_to = date.toISOString();

    await publishDefaultLanguageVariant(itemId, scheduled_to);
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

export const setDefaultLanguageVariantToCascadePublishStep = async (itemId: string): Promise<void> => {
    await getTestKenticoClient()
        .changeWorkflowStepOfLanguageVariant()
        .byItemId(itemId)
        .byLanguageId(EmptyGuid)
        .byWorkflowStepId(CASCADE_PUBLISH_ID)
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
