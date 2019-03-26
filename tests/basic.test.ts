import { algoliaIndex } from "../external/algoliaClient";
import { assertWithRetry } from "../shared/assertWithRetry";
import {
    addContentItem,
    createNewVersionOfDefaultLanguageVariant,
    publishDefaultLanguageVariant,
    unpublishDefaultLanguageVariant,
    upsertDefaultLanguageVariant,
} from "../shared/helperFunctions";
import { setupEnvironment, tearDownEnviroment } from "../shared/testEnvironment";

jest.setTimeout(300000);

beforeAll(async () => {
    await setupEnvironment();
});

afterAll(async () => {
    await tearDownEnviroment();
});

test("Search content of published article", async () => {
    const textToSearch = "rkmcorr2oj";
    const item = await addContentItem(`Test article (${textToSearch})`, "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Article (${textToSearch})`,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual(`Test Article (${textToSearch})`);
    });
});

test("Search introduction of published article", async () => {
    const textToSearch = "y8t3nisvo8";
    const item = await addContentItem(`Test article (${textToSearch})`, "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Article (${textToSearch})`,
        },
        {
            element: {
                codename: "introduction",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual(`Test Article (${textToSearch})`);
    });
});

test("Search content of published scenario", async () => {
    const textToSearch = "r94s4pmj7k";
    const item = await addContentItem(`Test scenario (${textToSearch})`, "scenario");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Scenario (${textToSearch})`,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual(`Test Scenario (${textToSearch})`);
    });
});

test("Search introduction of published scenario", async () => {
    const textToSearch = "8kkzev724c";
    const item = await addContentItem(`Test scenario (${textToSearch})`, "scenario");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Scenario (${textToSearch})`,
        },
        {
            element: {
                codename: "introduction",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual(`Test Scenario (${textToSearch})`);
    });
});

test("Search title of published article", async () => {
    const textToSearch = "ucsmfzybkh";
    const item = await addContentItem(`Test article (${textToSearch})`, "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Article (${textToSearch})`,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].content).toEqual(`Some random text`);
    });
});

test("Search content of a callout within an article", async () => {
    const textToSearch = "wixgm4pkzh";
    const callout = await addContentItem(`Test Callout (${textToSearch})`, "callout");
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in callout: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(callout.id);

    const article = await addContentItem(`Test article (tlhkvctfwx)`, "article");
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Article (tlhkvctfwx)`,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some content </p><object type=\"application/kenticocloud\" ` +
                    `data-type=\"item\" data-id=\"${callout.id}\"></object>`,
        },
    ]);
    await publishDefaultLanguageVariant(article.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(article.codename);
        expect(searchResponse.hits[0].title).toEqual(`Test Article (tlhkvctfwx)`);
    });
});

test("Search content of a content chunk within an article", async () => {
    const textToSearch = "ebzsgrk8hb";
    const contentChunk = await addContentItem(`Test Content Chunk (${textToSearch})`, "content_chunk");
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in content chunk: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(contentChunk.id);

    const article = await addContentItem(`Test article (8uw2u7qgww)`, "article");
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Article (8uw2u7qgww)`,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some content </p><object type=\"application/kenticocloud\" ` +
                    `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
        },
    ]);
    await publishDefaultLanguageVariant(article.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(article.codename);
        expect(searchResponse.hits[0].title).toEqual(`Test Article (8uw2u7qgww)`);
    });
});

test("Saga: Publish, unpublish, create new version", async () => {
    const textToSearch = "mlv0te5ymp";
    const item = await addContentItem(`Test article (${textToSearch})`, "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: `Test Article (${textToSearch})`,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);
        expect(searchResponse.hits.length).toBe(1);
    });

    await unpublishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);
        expect(searchResponse.hits.length).toBe(0);
    });

    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);
        expect(searchResponse.hits.length).toBe(1);
    });

    await createNewVersionOfDefaultLanguageVariant(item.id);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "content",
            },
            value: "<p>Some random text: e5yqdo8sdb.</p>",
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("e5yqdo8sdb");
        expect(searchResponse.hits.length).toBe(1);
    });
});
