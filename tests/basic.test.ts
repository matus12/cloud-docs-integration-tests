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
    const item = await addContentItem("Test article (rkmcorr2oj)", "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (rkmcorr2oj)",
        },
        {
            element: {
                codename: "content",
            },
            value: "<p>Some random text: rkmcorr2oj.</p>",
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("rkmcorr2oj");
        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual("Test Article (rkmcorr2oj)");
    });
});

test("Search introduction of published article", async () => {
    const item = await addContentItem("Test article (y8t3nisvo8)", "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (y8t3nisvo8)",
        },
        {
            element: {
                codename: "introduction",
            },
            value: "<p>Some random text: y8t3nisvo8.</p>",
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("y8t3nisvo8");
        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual("Test Article (y8t3nisvo8)");
    });
});

test("Search content of published scenario", async () => {
    const item = await addContentItem("Test scenario (r94s4pmj7k)", "scenario");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Scenario (r94s4pmj7k)",
        },
        {
            element: {
                codename: "content",
            },
            value: "<p>Some random text: r94s4pmj7k.</p>",
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("r94s4pmj7k");
        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual("Test Scenario (r94s4pmj7k)");
    });
});

test("Search introduction of published scenario", async () => {
    const item = await addContentItem("Test scenario (8kkzev724c)", "scenario");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Scenario (8kkzev724c)",
        },
        {
            element: {
                codename: "introduction",
            },
            value: "<p>Some random text: 8kkzev724c.</p>",
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("8kkzev724c");
        expect(searchResponse.hits.length).toBe(1);
        expect(searchResponse.hits[0].codename).toEqual(item.codename);
        expect(searchResponse.hits[0].title).toEqual("Test Scenario (8kkzev724c)");
    });
});

test("Saga: Publish, unpublish, create new version", async () => {
    const item = await addContentItem("Test article (mlv0te5ymp)", "article");
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (mlv0te5ymp)",
        },
        {
            element: {
                codename: "content",
            },
            value: "<p>Some random text: mlv0te5ymp.</p>",
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("mlv0te5ymp");
        expect(searchResponse.hits.length).toBe(1);
    });

    await unpublishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("mlv0te5ymp");
        expect(searchResponse.hits.length).toBe(0);
    });

    await publishDefaultLanguageVariant(item.id);

    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search("mlv0te5ymp");
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
