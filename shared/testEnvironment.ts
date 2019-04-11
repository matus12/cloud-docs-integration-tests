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
    readonly taxonomies: ITaxonomyLookup;
    readonly types: IContentTypeLookup;
}

interface ITaxonomyLookup {
    [id: string]: TaxonomyModels.Taxonomy;
}

interface IContentTypeLookup {
    [codename: string]: ContentTypeModels.ContentType;
}

export const setupEnvironment = async (): Promise<IEnvironmentContext> => {
    const destinationTaxonomies = await copyTaxonomies();
    const destinationTypes = await copyTypes(destinationTaxonomies);

    return {
        taxonomies: destinationTaxonomies,
        types: destinationTypes,
    };
};

export const tearDownEnviroment = async (context: IEnvironmentContext): Promise<void> => {
    const typeIds = Object.keys(context.types).map((key: string) => context.types[key].id);

    await deleteContentItems(typeIds);
    await deleteContentTypes(typeIds);
    await deleteTaxonomyGroups(context);
};

const copyTaxonomies = async (): Promise<ITaxonomyLookup> => {
    const destinationTaxonomies: ITaxonomyLookup = {};

    await getLiveKenticoClient()
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

    return destinationTaxonomies;
};

const copyTypes = async (destinationTaxonomies: ITaxonomyLookup): Promise<IContentTypeLookup> => {
    const client = getLiveKenticoClient();
    const destinationTypes: IContentTypeLookup = {};

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

    return destinationTypes;
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

const deleteTaxonomyGroups = async (context: IEnvironmentContext): Promise<void> => {
    const taxonomyIds = Object.keys(context.taxonomies).map((key: string) => context.taxonomies[key].id);
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

const deleteContentItems = async (typeIds: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    const items = await getTestKenticoClient()
        .listContentItems()
        .toPromise();

    const itemIds = items.data.items
        .filter((item: ContentItemModels.ContentItem) => typeIds.includes(item.type.id))
        .map((item: ContentItemModels.ContentItem) => item.id);

    for (const id of itemIds) {
        await client
            .deleteContentItem()
            .byItemId(id)
            .toPromise();
    }
};
