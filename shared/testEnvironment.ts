import {
    ContentItemModels,
    ContentTypeModels,
    ElementModels,
    TaxonomyModels,
} from "kentico-cloud-content-management";
import {
    getLiveKenticoClient,
    getTestKenticoClient,
} from "../external/kenticoClients";

const codenamesOfContentTypesToCopy = [
    "article",
    "callout",
    "content_chunk",
    "scenario",
    "code_sample",
    "code_samples",
];

export interface IEnvironmentContext {
    taxonomies: ITaxonomyLookup;
    types: IContentTypeLookup;
}

interface ITaxonomyLookup {
    [id: string]: TaxonomyModels.Taxonomy;
}

interface IContentTypeLookup {
    [codename: string]: ContentTypeModels.ContentType;
}

export const setupEnvironment = async (): Promise<IEnvironmentContext> => {
    const client = getLiveKenticoClient();
    const destinationTaxonomies: ITaxonomyLookup = {};
    const destinationTypes: IContentTypeLookup = {};

    await client
        .listTaxonomies()
        .toPromise()
        .then(async (taxonomies) => {
            for (const taxonomy of taxonomies.data) {
                const destinationTaxonomy = await getTestKenticoClient()
                    .addTaxonomy()
                    .withData(taxonomy)
                    .toPromise();

                destinationTaxonomies[taxonomy.id] = destinationTaxonomy.data;
            }
        });

    for (const codename of codenamesOfContentTypesToCopy) {
        await client
            .viewContentType()
            .byTypeCodename(codename)
            .toPromise()
            .then(async (response) => {
                const createdType = await addContentType(response.rawData, destinationTaxonomies);
                destinationTypes[codename] = createdType;

            });
    }

    return {
        taxonomies: destinationTaxonomies,
        types: destinationTypes,
    };
};

export const tearDownEnviroment = async (context: IEnvironmentContext) => {
    const taxonomyIds = Object.keys(context.taxonomies).map((key: string) => context.taxonomies[key].id);
    const typeIds = Object.keys(context.types).map((key: string) => context.types[key].id);

    const items = await getTestKenticoClient()
        .listContentItems()
        .toPromise();

    const itemIds = items.data.items
        .filter((item: ContentItemModels.ContentItem) => typeIds.includes(item.type.id))
        .map((item: ContentItemModels.ContentItem) => item.id);

    await deleteContentItems(itemIds);
    await deleteContentTypes(typeIds);
    await deleteTaxonomyGroups(taxonomyIds);
};

const addContentType = async (
    contentType: any,
    destinationTaxonomies: ITaxonomyLookup,
): Promise<ContentTypeModels.ContentType> => {
    const typeToCreate = processContentType(contentType, destinationTaxonomies);

    const response = await getTestKenticoClient()
        .addContentType()
        .withData(typeToCreate)
        .toPromise();

    return response.data;
};

const processContentType = (
    contentType: ContentTypeModels.ContentType,
    destinationTaxonomies: ITaxonomyLookup,
): ContentTypeModels.ContentType => {
    contentType.elements = contentType
        .elements
        .filter((element: ElementModels.ElementModel) =>
            element.type !== ElementModels.ElementType.urlSlug);

    contentType.elements = contentType.elements.map((element: any) => {
        switch (element.type) {
            case ElementModels.ElementType.taxonomy:
                return {
                    guidelines: element.guidelines,
                    taxonomy_group: {
                        id: destinationTaxonomies[element.taxonomy_group.id].id,
                    },
                    type: ElementModels.ElementType.taxonomy,
                };
            default:
                return element;
        }
    });

    return contentType;
};

const deleteTaxonomyGroups = async (taxonomyIds: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    for (const id of taxonomyIds) {
        await client
            .deleteTaxonomy()
            .byTaxonomyId(id)
            .toPromise();
    }
};

const deleteContentTypes = async (typeIds: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    for (const id of typeIds) {
        await client
            .deleteContentType()
            .byTypeId(id)
            .toPromise();
    }
};

const deleteContentItems = async (itemIds: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    for (const id of itemIds) {
        await client
            .deleteContentItem()
            .byItemId(id)
            .toPromise();
    }
};
