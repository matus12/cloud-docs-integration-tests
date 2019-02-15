import {ContentTypeModels, ElementModels} from "kentico-cloud-content-management";
import {
    DeleteContentItemQuery,
    DeleteContentTypeQuery,
    FullIdentifierQuery,
    IdCodenameIdentifierQuery,
} from "kentico-cloud-content-management/_commonjs/queries";
import IAddContentTypeData = ContentTypeModels.IAddContentTypeData;
import IAddContentTypeElementData = ContentTypeModels.IAddContentTypeElementData;
import IElementType = ElementModels.ElementType;
import {getLiveKenticoClient, getTestKenticoClient} from "../external/kenticoClients";

type DeleteAction =
    () => FullIdentifierQuery<DeleteContentItemQuery> | IdCodenameIdentifierQuery<DeleteContentTypeQuery>;

jest.setTimeout(20000);

const codenamesOfContentTypesToCopy = [
    "article",
    "callout",
    "content_chunk",
];

const addContentType = async (contentType: IAddContentTypeData) => {
    contentType.elements =
        contentType
            .elements
            .filter((element: IAddContentTypeElementData) =>
                element.type !== IElementType.taxonomy &&
                element.type !== IElementType.urlSlug);

    await getTestKenticoClient()
        .addContentType()
        .withData(contentType)
        .toPromise();
};

const deleteFromCloud =
    async (deleteAction: DeleteAction, codenames: string[]) => {
        for (const codename of codenames) {
            await deleteAction()
                .byCodename(codename)
                .toPromise();
        }
    };

beforeAll(async () => {
    for (const codename of codenamesOfContentTypesToCopy) {
        await getLiveKenticoClient()
            .viewContentType()
            .byCodename(codename)
            .toPromise()
            .then(async (response) => {
                await addContentType(response.data);
            });
    }
});

afterAll(async () => {
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
});

test("adds 1 + 2 to equal 3", async () => {
    await getTestKenticoClient()
        .addContentItem()
        .withData(
            {
                name: "New article",
                type: {
                    codename: "article",
                },
            })
        .toPromise();
    await getTestKenticoClient()
        .upsertLanguageVariant()
        .byCodename("new_article")
        .forLanguageId("00000000-0000-0000-0000-000000000000")
        .withElements([
            {
                element: {
                    codename: "title",
                },
                value: "Hello World",
            },
            {
                element: {
                    codename: "content",
                },
                value: "<p>Some really long text</p>",
            },
        ])
        .toPromise();

    expect(1 + 2).toBe(3);
});
