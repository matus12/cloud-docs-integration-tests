import {
    assertSearchRecordWithRetry,
    assertSearchWithRetry,
} from "../shared/assertWithRetry";
import {
    addContentItem,
    createNewVersionOfDefaultLanguageVariant,
    publishDefaultLanguageVariant,
    scheduleDefaultLanguageVariant,
    setDefaultLanguageVariantToCascadePublishStep,
    unpublishDefaultLanguageVariant,
    upsertDefaultLanguageVariant,
} from "../shared/kenticoCloudHelper";
import { randomize } from "../shared/randomize";
import {
    IEnvironmentContext,
    setupEnvironment,
    tearDownEnviroment,
} from "../shared/testEnvironment";
import { triggerPublisher } from "../external/triggerPublisher";

jest.setTimeout(300000);

let context: IEnvironmentContext;

beforeAll(async () => {
    context = await setupEnvironment();
});

afterAll(async () => {
    await tearDownEnviroment(context);
});

test("Search content of published article", async () => {
    const textToSearch = randomize("article_content");
    const title = randomize("title");

    const item = await addContentItem(`Test 1 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: title,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: `Some random text: ${textToSearch}.`,
        id: item.id,
        title,
    });
});

test("Search introduction of published article", async () => {
    const textToSearch = randomize("article_introduction");
    const title = randomize("title");

    const item = await addContentItem(`Test 2 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: title,
        },
        {
            element: {
                codename: "introduction",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: `Some random text: ${textToSearch}.`,
        id: item.id,
        title,
    });
});

test("Search content of published scenario", async () => {
    const textToSearch = randomize("scenario_content");
    const title = randomize("title");

    const item = await addContentItem(`Test 3 scenario (${textToSearch})`, context.types.scenario.codename);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: title,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: `Some random text: ${textToSearch}.`,
        id: item.id,
        title,
    });
});

test("Search introduction of published scenario", async () => {
    const textToSearch = randomize("scenario_introduction");
    const title = randomize("title");

    const item = await addContentItem(`Test 4 scenario (${textToSearch})`, context.types.scenario.codename);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: title,
        },
        {
            element: {
                codename: "introduction",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(item.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: `Some random text: ${textToSearch}.`,
        id: item.id,
        title,
    });
});

test("Search title of published article", async () => {
    const textToSearch = randomize("article_title");

    const item = await addContentItem(`Test 5 article (${textToSearch})`, context.types.article.codename);
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

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: "Some random text",
        id: item.id,
        title: `Test Article (${textToSearch})`,
    });
});

test("Search content of a callout within an article", async () => {
    const textToSearch = randomize("test_6");

    const callout = await addContentItem(`Test 6 Callout (${textToSearch})`, context.types.callout.codename);
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in callout: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(callout.id);

    const article = await addContentItem(`Test 6 article (tlhkvctfwx)`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (tlhkvctfwx)",
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

    await assertSearchRecordWithRetry(textToSearch, {
        codename: article.codename,
        content: `Some random text in callout: ${textToSearch}.`,
        id: article.id,
        title: "Test Article (tlhkvctfwx)",
    });
});

test("Search content of a content chunk within an article", async () => {
    const textToSearch = randomize("test_7");

    const contentChunk =
        await addContentItem(`Test 7 Content Chunk (${textToSearch})`, context.types.content_chunk.codename);
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in content chunk: ${textToSearch}.</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(contentChunk.id);

    const article = await addContentItem(`Test 7 article (8uw2u7qgww)`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (8uw2u7qgww)",
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
                    `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
        },
    ]);
    await publishDefaultLanguageVariant(article.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: article.codename,
        content: `Some random text in content chunk: ${textToSearch}.`,
        id: article.id,
        title: "Test Article (8uw2u7qgww)",
    });
});

test("Saga: Publish, unpublish, create new version", async () => {
    const textToSearch = randomize("test_8");
    const title = randomize("title");

    const item = await addContentItem(`Test 8 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: title,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${textToSearch}.</p>`,
        },
    ]);

    await publishDefaultLanguageVariant(item.id);
    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: `Some random text: ${textToSearch}.`,
        id: item.id,
        title,
    }, "Search published article");

    await unpublishDefaultLanguageVariant(item.id);
    await assertSearchWithRetry(textToSearch, 0, "Search unpublished article");

    await publishDefaultLanguageVariant(item.id);
    await assertSearchWithRetry(textToSearch, 1, "Search once more published article");

    const updatedTextToSearch = randomize("test_8");
    await createNewVersionOfDefaultLanguageVariant(item.id);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text: ${updatedTextToSearch}.</p>`,
        },
    ]);

    await publishDefaultLanguageVariant(item.id);
    await assertSearchWithRetry(updatedTextToSearch, 1, "Search updated article");
});

test("Saga: Search content of a hierarchical article using cascade publish", async () => {
    const calloutText = randomize("test_9");
    const callout = await addContentItem(`Test 9 Callout (${calloutText})`, context.types.callout.codename);
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in callout: ${calloutText}.</p>`,
        },
    ]);

    const contentChunkText = randomize("test_9");
    const contentChunk =
        await addContentItem(`Test 9 Content Chunk (${contentChunkText})`, context.types.content_chunk.codename);
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in content chunk: ${contentChunkText}.</p>` +
            `<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"${callout.id}\"></object>`,
        },
    ]);

    const article = await addContentItem(`Test 9 article (8uw2u7qgww)`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (8uw2u7qgww)",
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
                    `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
        },
    ]);

    await setDefaultLanguageVariantToCascadePublishStep(article.id);
    await triggerPublisher();

    await assertSearchRecordWithRetry(calloutText, {
        codename: article.codename,
        content: `Some random text in callout: ${calloutText}.`,
        id: article.id,
        title: "Test Article (8uw2u7qgww)",
    }, "Search by callout text should return a hit.");

    await assertSearchRecordWithRetry(contentChunkText, {
        codename: article.codename,
        content: `Some random text in content chunk: ${contentChunkText}.`,
        id: article.id,
        title: "Test Article (8uw2u7qgww)",
    }, "Search by content chunk text should return a hit.");

    await unpublishDefaultLanguageVariant(contentChunk.id);
    await assertSearchWithRetry(contentChunkText, 0, "Search by content chunk text shouldn't return a hit.");
    await assertSearchWithRetry(calloutText, 0, "Search by callout text shouldn't return a hit.");
});

test("Saga: Search content of a hierarchical article using scheduled publish", async () => {
    const calloutText = randomize("test_10");
    const callout = await addContentItem(`Test 10 Callout (${calloutText})`, context.types.callout.codename);
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in callout: ${calloutText}.</p>`,
        },
    ]);

    const contentChunkText = randomize("test_10");
    const contentChunk =
        await addContentItem(`Test 10 Content Chunk (${contentChunkText})`, context.types.content_chunk.codename);
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text in content chunk: ${contentChunkText}.</p>` +
                `<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"${callout.id}\"></object>`,
        },
    ]);

    const article = await addContentItem(`Test 10 article (8uw2u7gfgf)`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: "title",
            },
            value: "Test Article (8uw2u7gfgf)",
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
                `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
        },
    ]);

    await scheduleDefaultLanguageVariant(article.id);
    await triggerPublisher();

    await assertSearchRecordWithRetry(calloutText, {
        codename: article.codename,
        content: `Some random text in callout: ${calloutText}.`,
        id: article.id,
        title: "Test Article (8uw2u7gfgf)",
    }, "Search by callout text should return a hit.");

    await assertSearchRecordWithRetry(contentChunkText, {
        codename: article.codename,
        content: `Some random text in content chunk: ${contentChunkText}.`,
        id: article.id,
        title: "Test Article (8uw2u7gfgf)",
    }, "Search by content chunk text should return a hit.");

    await unpublishDefaultLanguageVariant(contentChunk.id);
    await assertSearchWithRetry(contentChunkText, 0, "Search by content chunk text shouldn't return a hit.");
    await assertSearchWithRetry(calloutText, 0, "Search by callout text shouldn't return a hit.");
});
