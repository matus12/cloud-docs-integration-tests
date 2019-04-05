import {
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

const destinationTaxonomies: { [id: string]: TaxonomyModels.Taxonomy; } = {};

export const setupEnvironment = async () => {
    const client = getLiveKenticoClient();

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
                await addContentType(response.rawData);
            });
    }
};

export const tearDownEnviroment = async () => {
    const codenamesOfContentItemsToDelete: string[] = [];

    await getTestKenticoClient()
        .listContentItems()
        .toPromise()
        .then((response) => {
            response
                .data
                .items
                .map((item) => codenamesOfContentItemsToDelete.push(item.codename));
        });

    const taxonomyCodenames: string[] = [];
    for (const key of Object.keys(destinationTaxonomies)) {
        const taxonomy = destinationTaxonomies[key];
        taxonomyCodenames.push(taxonomy.codename);
    }

    await deleteTaxonomyGroups(taxonomyCodenames);
    await deleteContentItems(codenamesOfContentItemsToDelete);
    await deleteContentTypes(codenamesOfContentTypesToCopy);
};

const addContentType = async (contentType: any) => {
    const typeToCreate = processContentType(contentType);

    await getTestKenticoClient()
        .addContentType()
        .withData(typeToCreate)
        .toPromise();
};

const processContentType = (contentType: ContentTypeModels.ContentType): ContentTypeModels.ContentType => {
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

const deleteTaxonomyGroups = async (taxonomyCodenames: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    for (const codename of taxonomyCodenames) {
        await client
            .deleteTaxonomy()
            .byTaxonomyCodename(codename)
            .toPromise();
    }
};

const deleteContentTypes = async (codenames: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    for (const codename of codenames) {
        await client
            .deleteContentType()
            .byTypeCodename(codename)
            .toPromise();
    }
};

const deleteContentItems = async (itemCodenames: string[]): Promise<void> => {
    const client = getTestKenticoClient();

    for (const codename of itemCodenames) {
        await client
            .deleteContentItem()
            .byItemCodename(codename)
            .toPromise();
    }
};
