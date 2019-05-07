import {
    ContentItemModels,
    ContentTypeModels,
    ElementModels,
    LanguageVariantModels,
    TaxonomyModels,
} from "kentico-cloud-content-management";
import {
    getLiveKenticoClient,
    getTestKenticoClient,
} from "../external/kenticoClients";
import {
    addContentItem,
    publishDefaultLanguageVariant,
    upsertDefaultLanguageVariant
} from "./kenticoCloudHelper";
import {
    author,
    footer,
    home,
    navigation_item,
    scenario,
    topic,
    uiMessages
} from "./requiredWebItems";
import { Types } from "./constants";
import ContentItem = ContentItemModels.ContentItem;

const typesPublishedInSetup = [
    Types.Author,
    Types.Footer,
    Types.Scenario,
    Types.UImessages,
    Types.NavigationItem,
    Types.Home
];

const webCompulsoryContentTypes = [
    Types.Topic,
    ...typesPublishedInSetup
];

const codenamesOfContentTypesToCopy = [
    Types.Article,
    Types.Callout,
    Types.CodeSample,
    Types.CodeSamples,
    Types.ContentChunk,
    ...webCompulsoryContentTypes
];

export interface IEnvironmentContext {
    readonly taxonomies: ITaxonomyLookup;
    readonly types: IContentTypeLookup;
    readonly items: ContentItem[];
}

interface ITaxonomyLookup {
    [id: string]: TaxonomyModels.Taxonomy;
}

interface IContentTypeLookup {
    [codename: string]: ContentTypeModels.ContentType;
}

interface TitleElement extends ElementModels.ElementModel {
    external_id?: string;
}

interface UrlSlugElement extends ElementModels.ElementModel {
    depends_on?: {
        element: {
            external_id: string;
        }
    };
}

export const setupEnvironment = async (): Promise<IEnvironmentContext> => {
    const destinationTaxonomies = await copyTaxonomies();
    const destinationTypes = await copyTypes(destinationTaxonomies);
    const destinationItems = await createWebCompulsoryItems();

    return {
        taxonomies: destinationTaxonomies,
        types: destinationTypes,
        items: destinationItems
    };
};

export const tearDownEnvironment = async (context: IEnvironmentContext): Promise<void> => {
    const typeIds = Object.keys(context.types).map((key: string) => context.types[key].id);

    await deleteContentItems(typeIds);
    await deleteContentTypes(typeIds);
    await deleteTaxonomyGroups(context);
};

const createItemVariant = (codename: string): LanguageVariantModels.ILanguageVariantElement[] | undefined => {
    switch (codename) {
        case Types.Author: {
            return author;
        }
        case Types.Footer: {
            return footer;
        }
        case Types.Topic: {
            return topic;
        }
        case Types.Scenario: {
            return scenario;
        }
        case Types.NavigationItem: {
            return navigation_item;
        }
        case Types.Home: {
            return home;
        }
        case Types.UImessages: {
            return uiMessages;
        }
    }
};

const createWebCompulsoryItems = async (): Promise<ContentItem[]> => {
    let items = [] as ContentItem[];
    for (const type of webCompulsoryContentTypes) {
        const item = await addContentItem(type, type);
        const variant = createItemVariant(item.codename);

        if (variant !== undefined) {
            await upsertDefaultLanguageVariant(item.id, variant);
        }

        if (item.codename !== 'topic') {
            await publishDefaultLanguageVariant(item.id);
        }

        items.push(item);
    }

    return items;
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
                destinationTypes[codename] = await addContentType(response.rawData, destinationTaxonomies);
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

function resolveUrlSlugElementDependency(contentType: ContentTypeModels.ContentType) {
    const titleElement: TitleElement | undefined = contentType.elements.find(element => element.codename === 'title');
    const urlElement: UrlSlugElement | undefined = contentType.elements.find(element => element.codename === 'url');

    if (urlElement && titleElement) {
        titleElement.external_id = titleElement.id + "-external";
        urlElement.depends_on && urlElement.depends_on.element
            ? urlElement.depends_on.element = {
                external_id: titleElement.external_id,
            }
            : null;
    }
}

const processContentType = (
    contentType: ContentTypeModels.ContentType,
    destinationTaxonomies: ITaxonomyLookup,
): ContentTypeModels.ContentType => {
    // @ts-ignore
    contentType.elements = contentType.elements.map(element => {
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

    resolveUrlSlugElementDependency(contentType);

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
