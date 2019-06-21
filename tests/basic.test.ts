import { ContentItemModels } from 'kentico-cloud-content-management';
import {
    Builder,
    By,
    WebDriver,
} from 'selenium-webdriver';
import ContentItem = ContentItemModels.ContentItem;
import { Options } from 'selenium-webdriver/chrome';
import { triggerPublisher } from '../external/triggerPublisher';
import {
    assertSearchRecordWithRetry,
    assertSearchWithRetry,
} from '../shared/assertWithRetry';
import {
    IdAttributes,
    Types,
} from '../shared/constants';
import {
    assertContentOnWeb,
    assertNoSuggestions,
    findElementWithRetry,
    getExpectedUrl,
    getSearchableContent,
    getSearchSuggestionTextAndRedirect,
    insertArticleToTopic,
    insertScenarioToNavigationItem,
    searchAndWaitForSuggestions,
    typeIntoSearchInput,
    waitForUrlMapCacheUpdate,
} from '../shared/helpers';
import {
    addContentItem,
    createNewVersionOfDefaultLanguageVariant,
    publishDefaultLanguageVariant,
    scheduleDefaultLanguageVariant,
    setDefaultLanguageVariantToCascadePublishStep,
    unpublishDefaultLanguageVariant,
    upsertDefaultLanguageVariant,
} from '../shared/kenticoCloudHelper';
import { WEB_URL } from '../shared/projectSettings';
import { randomize } from '../shared/randomize';
import {
    IEnvironmentContext,
    setupEnvironment,
    tearDownEnvironment,
} from '../shared/testEnvironment';

require('chromedriver');

jest.setTimeout(360000);

let context: IEnvironmentContext;
let driver: WebDriver;

beforeAll(async () => {
    context = await setupEnvironment();
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new Options()
             .headless()
                .addArguments(
                    '--disk-cache-dir=null',
                    '--disable-application-cache',
                ),
        )
        .build();
});

afterAll(async () => {
    await tearDownEnvironment(context);
    await driver.quit();
});

beforeEach(async () => {
    await driver.get(WEB_URL);
});

test.only('Search content of published article', async () => {
    const textToSearch = randomize('article_content');
    const title = randomize('title');
    const heading = randomize('heading');
    const content = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        heading,
        content,
        expectedUrl: getExpectedUrl(Types.Article, title, heading),
    };

    const article = await addContentItem(`Test 1 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: 'title',
            },
            value: title,
        },
        {
            element: {
                codename: 'content',
            },
            value: `<h2>${heading}</h2><p>${content}</p>`,
        },
    ]);

    const topic = await insertArticleToTopic(article, context);

    await publishDefaultLanguageVariant(topic.id);
    await publishDefaultLanguageVariant(article.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: article.codename,
        content,
        id: article.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, article.codename);
    let searchSuggestionText = '';
    let url = await driver.getCurrentUrl();
    while (url !== expectedValues.expectedUrl) {
        await searchAndWaitForSuggestions(driver, textToSearch);
        searchSuggestionText = await getSearchSuggestionTextAndRedirect(driver, expectedValues.expectedUrl);

        await driver.sleep(3000);
        url = await driver.getCurrentUrl();
    }

    const actualValues = {
        searchSuggestionText,
        urlWithoutQuery: await driver.getCurrentUrl(),
        searchableContent: await getSearchableContent(driver),
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test.only('Search introduction of published article', async () => {
    const textToSearch = randomize('article_introduction');
    const title = randomize('title');
    const content = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        content,
        heading: '',
        expectedUrl: getExpectedUrl(Types.Article, title),
    };

    const article = await addContentItem(`Test 2 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: 'title',
            },
            value: title,
        },
        {
            element: {
                codename: 'introduction',
            },
            value: `<p>${content}</p>`,
        },
    ]);
    const topic = await insertArticleToTopic(article, context);

    await publishDefaultLanguageVariant(article.id);
    await publishDefaultLanguageVariant(topic.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: article.codename,
        content,
        id: article.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, article.codename);
    let searchSuggestionText = '';
    let url = await driver.getCurrentUrl();
    while (url !== expectedValues.expectedUrl) {
        await searchAndWaitForSuggestions(driver, textToSearch);
        searchSuggestionText = await getSearchSuggestionTextAndRedirect(driver, expectedValues.expectedUrl);

        await driver.sleep(3000);
        url = await driver.getCurrentUrl();
    }

    const actualValues = {
        searchSuggestionText,
        urlWithoutQuery: await driver.getCurrentUrl(),
        searchableContent: await getSearchableContent(driver),
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test.only('Search content of published scenario', async () => {
    const textToSearch = randomize('scenario_content');
    const title = randomize('title');
    const content = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        heading: '',
        content,
        expectedUrl: getExpectedUrl(Types.Scenario, title),
    };

    const scenario = await addContentItem(`Test 3 scenario (${textToSearch})`, context.types.scenario.codename);
    await upsertDefaultLanguageVariant(scenario.id, [
        {
            element: {
                codename: 'title',
            },
            value: title,
        },
        {
            element: {
                codename: 'content',
            },
            value: `<p>${content}</p>`,
        },
    ]);
    const navigationItem = await insertScenarioToNavigationItem(scenario, context);

    await publishDefaultLanguageVariant(scenario.id);
    await publishDefaultLanguageVariant(navigationItem.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: scenario.codename,
        content,
        id: scenario.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, scenario.codename);
    let searchSuggestionText = '';
    let url = await driver.getCurrentUrl();
    while (url !== expectedValues.expectedUrl) {
        await searchAndWaitForSuggestions(driver, textToSearch);
        searchSuggestionText = await getSearchSuggestionTextAndRedirect(driver, expectedValues.expectedUrl);

        await driver.sleep(3000);
        url = await driver.getCurrentUrl();
    }

    const actualValues = {
        searchSuggestionText,
        urlWithoutQuery: await driver.getCurrentUrl(),
        searchableContent: await getSearchableContent(driver),
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test.only('Search introduction of published scenario', async () => {
    const textToSearch = randomize('scenario_introduction');
    const title = randomize('title');
    const introduction = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        content: introduction,
        heading: '',
        expectedUrl: getExpectedUrl(Types.Scenario, title),
    };

    const scenario = await addContentItem(`Test 4 scenario (${textToSearch})`, context.types.scenario.codename);
    await upsertDefaultLanguageVariant(scenario.id, [
        {
            element: {
                codename: 'title',
            },
            value: title,
        },
        {
            element: {
                codename: 'introduction',
            },
            value: `<p>${introduction}</p>`,
        },
    ]);
    const navigationItem = await insertScenarioToNavigationItem(scenario, context);

    await publishDefaultLanguageVariant(scenario.id);
    await publishDefaultLanguageVariant(navigationItem.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: scenario.codename,
        content: introduction,
        id: scenario.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, scenario.codename);
    let searchSuggestionText = '';
    let url = await driver.getCurrentUrl();
    while (url !== expectedValues.expectedUrl) {
        await searchAndWaitForSuggestions(driver, textToSearch);
        searchSuggestionText = await getSearchSuggestionTextAndRedirect(driver, expectedValues.expectedUrl);

        await driver.sleep(3000);
        url = await driver.getCurrentUrl();
    }

    const actualValues = {
        searchSuggestionText,
        urlWithoutQuery: await driver.getCurrentUrl(),
        searchableContent: await getSearchableContent(driver),
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test.only('Search title of published article', async () => {
    const textToSearch = randomize('article_title');
    const content = 'Some random text';
    const expectedValues = {
        content,
        heading: '',
        expectedUrl: getExpectedUrl(Types.Article, textToSearch),
    };

    const article = await addContentItem(`Test 5 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(article.id, [
        {
            element: {
                codename: 'title',
            },
            value: textToSearch,
        },
        {
            element: {
                codename: 'content',
            },
            value: `<p>${content}</p>`,
        },
    ]);
    const topic = await insertArticleToTopic(article, context);
    const navigationItem = await insertScenarioToNavigationItem({ codename: 'scenario' } as ContentItem, context);

    await publishDefaultLanguageVariant(article.id);
    await publishDefaultLanguageVariant(topic.id);
    await publishDefaultLanguageVariant(navigationItem.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: article.codename,
        content,
        id: article.id,
        title: textToSearch,
    });

    await waitForUrlMapCacheUpdate(driver, article.codename);
    let searchSuggestionText = '';
    let url = await driver.getCurrentUrl();
    while (url !== expectedValues.expectedUrl) {
        await searchAndWaitForSuggestions(driver, textToSearch);
        searchSuggestionText = await getSearchSuggestionTextAndRedirect(driver, expectedValues.expectedUrl);

        await driver.sleep(3000);
        url = await driver.getCurrentUrl();
    }

    const actualValues = {
        searchSuggestionText,
        urlWithoutQuery: await driver.getCurrentUrl(),
        searchableContent: await getSearchableContent(driver),
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search content of a callout within an article", async () => {
    const textToSearch = randomize("test_6");
     const content = `Some random text in callout: ${textToSearch}`;
     const title = randomize('title');
     const expectedValues = {
         heading: '',
         content,
         expectedUrl: getExpectedUrl(Types.Article, title)
     };

     const callout = await addContentItem(`Test 6 Callout (${textToSearch})`, context.types.callout.codename);
     await upsertDefaultLanguageVariant(callout.id, [
         {
             element: {
                 codename: "content",
             },
             value: `<p>${content}</p>`,
         },
     ]);
     await publishDefaultLanguageVariant(callout.id);

     const article = await addContentItem(`Test 6 article (tlhkvctfwx)`, context.types.article.codename);
     await upsertDefaultLanguageVariant(article.id, [
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
             value: `<p>Some content </p><object type=\"application/kenticocloud\" ` +
                 `data-type=\"item\" data-id=\"${callout.id}\"></object>`,
         },
     ]);

     const topic = await insertArticleToTopic(article, context);

     await publishDefaultLanguageVariant(article.id);
     await publishDefaultLanguageVariant(topic.id);

     await assertSearchRecordWithRetry(textToSearch, {
         codename: article.codename,
         content: content,
         id: article.id,
         title,
     });

     await waitForUrlMapCacheUpdate(driver, article.codename);
     let searchSuggestionText = '';
    let url = await driver.getCurrentUrl();
    while (url !== expectedValues.expectedUrl) {
        await searchAndWaitForSuggestions(driver, textToSearch);
        searchSuggestionText = await getSearchSuggestionTextAndRedirect(driver, expectedValues.expectedUrl);

        await driver.sleep(3000);
        url = await driver.getCurrentUrl();
    }

     const actualValues = {
         searchSuggestionText,
         urlWithoutQuery: await driver.getCurrentUrl(),
         searchableContent: await getSearchableContent(driver)
     };

     assertContentOnWeb(actualValues, expectedValues);
 });

// test("Search content of a content chunk within an article", async () => {
//     const textToSearch = randomize("test_7");
//     const content = `Some random text in content chunk: ${textToSearch}.`;
//     const title = randomize("title");
//     const expectedValues = {
//         heading: '',
//         content,
//         expectedUrl: getExpectedUrl(Types.Article, title)
//     };
//
//     const contentChunk =
//         await addContentItem(`Test 7 Content Chunk (${textToSearch})`, context.types.content_chunk.codename);
//     await upsertDefaultLanguageVariant(contentChunk.id, [
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${content}</p>`,
//         },
//     ]);
//     await publishDefaultLanguageVariant(contentChunk.id);
//
//     const article = await addContentItem(`Test 7 article (8uw2u7qgww)`, context.types.article.codename);
//     await upsertDefaultLanguageVariant(article.id, [
//         {
//             element: {
//                 codename: "title",
//             },
//             value: title,
//         },
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
//                 `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
//         },
//     ]);
//
//     const topic = await insertArticleToTopic(article, context);
//
//     await publishDefaultLanguageVariant(article.id);
//     await publishDefaultLanguageVariant(topic.id);
//
//     await assertSearchRecordWithRetry(textToSearch, {
//         codename: article.codename,
//         content,
//         id: article.id,
//         title,
//     });
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, textToSearch);
//
//     const actualValues = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     assertContentOnWeb(actualValues, expectedValues);
// });
//
// test("Saga: Publish, unpublish, create new version", async () => {
//     const textToSearch = randomize("test_8");
//     const title = randomize("title");
//     const content = `Some random text: ${textToSearch}.`;
//     const expectedValues = {
//         heading: '',
//         content,
//         expectedUrl: getExpectedUrl(Types.Article, title)
//     };
//
//     const article = await addContentItem(`Test 8 article (${textToSearch})`, context.types.article.codename);
//     await upsertDefaultLanguageVariant(article.id, [
//         {
//             element: {
//                 codename: "title",
//             },
//             value: title,
//         },
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${content}</p>`,
//         },
//     ]);
//
//     const topic = await insertArticleToTopic(article, context);
//
//     await publishDefaultLanguageVariant(article.id);
//     await publishDefaultLanguageVariant(topic.id);
//
//     await assertSearchRecordWithRetry(textToSearch, {
//         codename: article.codename,
//         content,
//         id: article.id,
//         title,
//     }, "Search published article");
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, textToSearch);
//
//     const actualValuesFirstPublish = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     assertContentOnWeb(actualValuesFirstPublish, expectedValues);
//
//     await unpublishDefaultLanguageVariant(article.id);
//     await assertSearchWithRetry(textToSearch, 0, "Search unpublished article");
//
//     await driver.get(WEB_URL);
//     let searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));
//
//     await typeIntoSearchInput(textToSearch, searchInput, driver);
//     await assertNoSuggestions(driver);
//
//     await publishDefaultLanguageVariant(article.id);
//     await assertSearchWithRetry(textToSearch, 1, "Search once more published article");
//
//     await driver.navigate().refresh();
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, textToSearch);
//
//     const actualValuesSecondPublish = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     assertContentOnWeb(actualValuesSecondPublish, expectedValues);
//     await driver.get(WEB_URL);
//
//     const updatedTextToSearch = randomize("test_8");
//     const updatedArticleContent = `Some random text: ${updatedTextToSearch}.`;
//
//     await createNewVersionOfDefaultLanguageVariant(article.id);
//     await upsertDefaultLanguageVariant(article.id, [
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${updatedArticleContent}</p>`,
//         },
//     ]);
//
//     await publishDefaultLanguageVariant(article.id);
//     await assertSearchWithRetry(updatedTextToSearch, 1, "Search updated article");
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, updatedTextToSearch);
//     expectedValues.content = updatedArticleContent;
//
//     const actualValuesThirdPublish = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     assertContentOnWeb(actualValuesThirdPublish, expectedValues);
// });
//
// test("Saga: Search content of a hierarchical article using cascade publish", async () => {
//     const calloutText = randomize("test_9");
//     const title = randomize("title");
//     const content = `Some random text in callout: ${calloutText}.`;
//     const expectedValues = {
//         heading: '',
//         content,
//         expectedUrl: getExpectedUrl(Types.Article, title)
//     };
//
//     const callout = await addContentItem(`Test 9 Callout (${calloutText})`, context.types.callout.codename);
//     await upsertDefaultLanguageVariant(callout.id, [
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${content}</p>`,
//         },
//     ]);
//
//     const contentChunkText = randomize("test_9");
//     const contentChunkContent = `Some random text in content chunk: ${contentChunkText}.`;
//     const contentChunk =
//         await addContentItem(`Test 9 Content Chunk (${contentChunkText})`, context.types.content_chunk.codename);
//     await upsertDefaultLanguageVariant(contentChunk.id, [
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${contentChunkContent}</p>` +
//                 `<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"${callout.id}\"></object>`,
//         },
//     ]);
//
//     const article = await addContentItem(`Test 9 article (8uw2u7qgww)`, context.types.article.codename);
//     await upsertDefaultLanguageVariant(article.id, [
//         {
//             element: {
//                 codename: "title",
//             },
//             value: title,
//         },
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
//                 `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
//         },
//     ]);
//
//     const topic = await insertArticleToTopic(article, context);
//
//     await setDefaultLanguageVariantToCascadePublishStep(article.id);
//     await triggerPublisher();
//     await publishDefaultLanguageVariant(topic.id);
//
//     await assertSearchRecordWithRetry(calloutText, {
//         codename: article.codename,
//         content: `Some random text in callout: ${calloutText}.`,
//         id: article.id,
//         title,
//     }, "Search by callout text should return a hit.");
//
//     await assertSearchRecordWithRetry(contentChunkText, {
//         codename: article.codename,
//         content: `Some random text in content chunk: ${contentChunkText}.`,
//         id: article.id,
//         title,
//     }, "Search by content chunk text should return a hit.");
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, calloutText);
//
//     const actualCalloutValues = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     assertContentOnWeb(actualCalloutValues, expectedValues);
//
//     await driver.get(WEB_URL);
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, contentChunkText);
//
//     const actualContentChunkValues = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     expectedValues.content = contentChunkContent;
//
//     assertContentOnWeb(actualContentChunkValues, expectedValues);
//
//     await unpublishDefaultLanguageVariant(contentChunk.id);
//     await assertSearchWithRetry(contentChunkText, 0, "Search by content chunk text shouldn't return a hit.");
//     await assertSearchWithRetry(calloutText, 0, "Search by callout text shouldn't return a hit.");
//
//     await driver.get(WEB_URL);
//     let searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));
//
//     await typeIntoSearchInput(contentChunkText, searchInput, driver);
//     await assertNoSuggestions(driver);
//
//     await driver.navigate().refresh();
//     searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));
//
//     await typeIntoSearchInput(calloutText, searchInput, driver);
//     await assertNoSuggestions(driver);
// });
//
// test("Saga: Search content of a hierarchical article using scheduled publish", async () => {
//     const calloutText = randomize("test_10");
//     const title = randomize("title");
//     const content = `Some random text in callout: ${calloutText}.`;
//     const expectedValues = {
//         heading: '',
//         content,
//         expectedUrl: getExpectedUrl(Types.Article, title)
//     };
//
//     const callout = await addContentItem(`Test 10 Callout (${calloutText})`, context.types.callout.codename);
//     await upsertDefaultLanguageVariant(callout.id, [
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${content}</p>`,
//         },
//     ]);
//
//     const contentChunkText = randomize("test_10");
//     const contentChunkContent = `Some random text in content chunk: ${contentChunkText}.`;
//     const contentChunk =
//         await addContentItem(`Test 10 Content Chunk (${contentChunkText})`, context.types.content_chunk.codename);
//     await upsertDefaultLanguageVariant(contentChunk.id, [
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>${contentChunkContent}</p>` +
//                 `<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"${callout.id}\"></object>`,
//         },
//     ]);
//
//     const article = await addContentItem(`Test 10 article (8uw2u7qgww)`, context.types.article.codename);
//     await upsertDefaultLanguageVariant(article.id, [
//         {
//             element: {
//                 codename: "title",
//             },
//             value: title,
//         },
//         {
//             element: {
//                 codename: "content",
//             },
//             value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
//                 `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
//         },
//     ]);
//
//     const topic = await insertArticleToTopic(article, context);
//
//     await scheduleDefaultLanguageVariant(article.id);
//     await triggerPublisher();
//     await publishDefaultLanguageVariant(topic.id);
//
//     await assertSearchRecordWithRetry(calloutText, {
//         codename: article.codename,
//         content: `Some random text in callout: ${calloutText}.`,
//         id: article.id,
//         title,
//     }, "Search by callout text should return a hit.");
//
//     await assertSearchRecordWithRetry(contentChunkText, {
//         codename: article.codename,
//         content: `Some random text in content chunk: ${contentChunkText}.`,
//         id: article.id,
//         title,
//     }, "Search by content chunk text should return a hit.");
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, calloutText);
//
//     const actualCalloutValues = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     assertContentOnWeb(actualCalloutValues, expectedValues);
//
//     await driver.get(WEB_URL);
//
//     await waitForUrlMapCacheUpdate(driver, article.codename);
//     await searchAndWaitForSuggestions(driver, contentChunkText);
//
//     const actualContentChunkValues = {
//         searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
//         urlWithoutQuery: await driver.getCurrentUrl(),
//         searchableContent: await getSearchableContent(driver)
//     };
//
//     expectedValues.content = contentChunkContent;
//
//     assertContentOnWeb(actualContentChunkValues, expectedValues);
//
//     await unpublishDefaultLanguageVariant(contentChunk.id);
//     await assertSearchWithRetry(contentChunkText, 0, "Search by content chunk text shouldn't return a hit.");
//     await assertSearchWithRetry(calloutText, 0, "Search by callout text shouldn't return a hit.");
//
//     await driver.get(WEB_URL);
//     let searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));
//
//     await typeIntoSearchInput(contentChunkText, searchInput, driver);
//     await assertNoSuggestions(driver);
//
//     await driver.navigate().refresh();
//
//     searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));
//
//     await typeIntoSearchInput(calloutText, searchInput, driver);
//     await assertNoSuggestions(driver);
// });
