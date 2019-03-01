import {
    DeleteContentItemQuery,
    DeleteContentTypeQuery,
    DeleteTaxonomyQuery,
    ElementModels,
    FullIdentifierQuery,
    IdCodenameIdentifierQuery,
    TaxonomyModels,
} from "kentico-cloud-content-management";
import {
    getLiveKenticoClient,
    getTestKenticoClient,
} from "../external/kenticoClients";

type DeleteAction =
    () => FullIdentifierQuery<DeleteContentItemQuery> |
    IdCodenameIdentifierQuery<DeleteContentTypeQuery> |
    FullIdentifierQuery<DeleteTaxonomyQuery>;

const codenamesOfContentTypesToCopy = [
    "article",
    "callout",
    "content_chunk",
    "scenario",
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
            .byCodename(codename)
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

    await deleteFromCloud(
        () => getTestKenticoClient().deleteContentItem(),
        codenamesOfContentItemsToDelete,
    );
    await deleteFromCloud(
        () => getTestKenticoClient().deleteContentType(),
        codenamesOfContentTypesToCopy,
    );

    const taxonomyCodenames = [];
    for (const key of Object.keys(destinationTaxonomies)) {
        const taxonomy = destinationTaxonomies[key];
        taxonomyCodenames.push(taxonomy.codename);
    }

    await deleteFromCloud(
        () => getTestKenticoClient().deleteTaxonomy(),
        taxonomyCodenames,
    );
};

const addContentType = async (contentType: any) => {
    contentType.elements =
        contentType
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

    await getTestKenticoClient()
        .addContentType()
        .withData(contentType)
        .toPromise();
};

const deleteFromCloud = async (deleteAction: DeleteAction, codenames: string[]) => {
    for (const codename of codenames) {
        await deleteAction()
            .byCodename(codename)
            .toPromise();
    }
};
