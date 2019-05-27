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
    upsertDefaultLanguageVariant
} from "../shared/kenticoCloudHelper";
import { randomize } from "../shared/randomize";
import {
    IEnvironmentContext,
    setupEnvironment,
    tearDownEnvironment,
} from "../shared/testEnvironment";
import { getWebUrl } from "../shared/projectSettings";
import { triggerPublisher } from "../external/triggerPublisher";
import {
    assertCodeSamplesOnWeb,
    assertContentOnWeb,
    assertNoSuggestions,
    getExpectedUrl,
    getSearchableContent,
    getSearchSuggestionTextAndRedirect,
    getUrlWithoutQuery,
    insertArticleToTopic,
    insertScenarioToNavigationItem,
    searchAndWaitForSuggestions,
    typeIntoSearchInput,
    waitForUrlMapCacheUpdate
} from "../shared/helpers";
import {
    Builder,
    By,
    WebDriver,
    WebElement
} from "selenium-webdriver";
import {
    IdAttributes,
    Types
} from "../shared/constants";
import {
    ContentItemModels,
    ContentItemResponses
} from "kentico-cloud-content-management";
import ContentItem = ContentItemModels.ContentItem;
import { Options } from "selenium-webdriver/chrome";
import { gitCommitPush } from "../shared/github/githubHelper";
import { getTestKenticoClient } from "../external/kenticoClients";
import ViewContentItemResponse = ContentItemResponses.ViewContentItemResponse;

require('chromedriver');

jest.setTimeout(400000);

let context: IEnvironmentContext;
let driver: WebDriver;

beforeAll(async () => {
    context = await setupEnvironment();
});

afterAll(async () => {
    await tearDownEnvironment(context);
});

beforeEach(async () => {
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new Options()
        // .headless()
            .addArguments('--disk-cache-dir=null', '--disable-application-cache'))
        .build();
    await driver.get(getWebUrl());
});

afterEach(async () => {
    await driver.quit();
});

test("Search content of published article", async () => {
    const textToSearch = randomize("article_content");
    const title = randomize("title");
    const heading = randomize('heading');
    const articleContent = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        heading,
        content: articleContent,
        expectedUrl: getExpectedUrl(Types.Article, title, heading)
    };

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
            value: `<h2>${heading}</h2><p>${articleContent}</p>`,
        },
    ]);

    const topic = await insertArticleToTopic(item, context);

    await publishDefaultLanguageVariant(topic.id);
    await publishDefaultLanguageVariant(item.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: articleContent,
        id: item.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search introduction of published article", async () => {
    const textToSearch = randomize("article_introduction");
    const title = randomize("title");
    const articleContent = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        content: articleContent,
        heading: '',
        expectedUrl: getExpectedUrl(Types.Article, title)
    };

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
            value: `<p>${articleContent}</p>`,
        },
    ]);
    const topic = await insertArticleToTopic(item, context);

    await publishDefaultLanguageVariant(item.id);
    await publishDefaultLanguageVariant(topic.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: articleContent,
        id: item.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search content of published scenario", async () => {
    const textToSearch = randomize("scenario_content");
    const title = randomize("title");
    const scenarioContent = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        heading: '',
        content: scenarioContent,
        expectedUrl: getExpectedUrl(Types.Scenario, title)
    };

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
            value: `<p>${scenarioContent}</p>`,
        },
    ]);
    const navigationItem = await insertScenarioToNavigationItem(item, context);

    await publishDefaultLanguageVariant(item.id);
    await publishDefaultLanguageVariant(navigationItem.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: scenarioContent,
        id: item.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search introduction of published scenario", async () => {
    const textToSearch = randomize("scenario_introduction");
    const title = randomize("title");
    const scenarioIntroduction = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        content: scenarioIntroduction,
        heading: '',
        expectedUrl: getExpectedUrl(Types.Scenario, title)
    };

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
            value: `<p>${scenarioIntroduction}</p>`,
        },
    ]);
    const navigationItem = await insertScenarioToNavigationItem(item, context);

    await publishDefaultLanguageVariant(item.id);
    await publishDefaultLanguageVariant(navigationItem.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: scenarioIntroduction,
        id: item.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search title of published article", async () => {
    const textToSearch = randomize("article_title");
    const articleContent = 'Some random text';
    const expectedValues = {
        content: articleContent,
        heading: '',
        expectedUrl: getExpectedUrl(Types.Article, textToSearch)
    };

    const item = await addContentItem(`Test 5 article (${textToSearch})`, context.types.article.codename);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "title",
            },
            value: textToSearch,
        },
        {
            element: {
                codename: "content",
            },
            value: `<p>Some random text</p>`,
        },
    ]);
    const topic = await insertArticleToTopic(item, context);
    const navigation_item = await insertScenarioToNavigationItem({ codename: 'scenario' } as ContentItem, context);

    await publishDefaultLanguageVariant(item.id);
    await publishDefaultLanguageVariant(topic.id);
    await publishDefaultLanguageVariant(navigation_item.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: articleContent,
        id: item.id,
        title: textToSearch,
    });

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search content of a callout within an article", async () => {
    const textToSearch = randomize("test_6");
    const calloutContent = `Some random text in callout: ${textToSearch}`;
    const title = randomize('title');
    const expectedValues = {
        heading: '',
        content: calloutContent,
        expectedUrl: getExpectedUrl(Types.Article, title)
    };

    const callout = await addContentItem(`Test 6 Callout (${textToSearch})`, context.types.callout.codename);
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${calloutContent}</p>`,
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
        content: calloutContent,
        id: article.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, article.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Search content of a content chunk within an article", async () => {
    const textToSearch = randomize("test_7");
    const contentChunkContent = `Some random text in content chunk: ${textToSearch}.`;
    const title = randomize("title");
    const expectedValues = {
        heading: '',
        content: contentChunkContent,
        expectedUrl: getExpectedUrl(Types.Article, title)
    };

    const contentChunk =
        await addContentItem(`Test 7 Content Chunk (${textToSearch})`, context.types.content_chunk.codename);
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${contentChunkContent}</p>`,
        },
    ]);
    await publishDefaultLanguageVariant(contentChunk.id);

    const article = await addContentItem(`Test 7 article (8uw2u7qgww)`, context.types.article.codename);
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
            value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
                `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
        },
    ]);

    const topic = await insertArticleToTopic(article, context);

    await publishDefaultLanguageVariant(article.id);
    await publishDefaultLanguageVariant(topic.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: article.codename,
        content: contentChunkContent,
        id: article.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, article.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValues, expectedValues);
});

test("Saga: Publish, unpublish, create new version", async () => {
    const textToSearch = randomize("test_8");
    const title = randomize("title");
    const articleContent = `Some random text: ${textToSearch}.`;
    const expectedValues = {
        heading: '',
        content: articleContent,
        expectedUrl: getExpectedUrl(Types.Article, title)
    };

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
            value: `<p>${articleContent}</p>`,
        },
    ]);

    const topic = await insertArticleToTopic(item, context);

    await publishDefaultLanguageVariant(item.id);
    await publishDefaultLanguageVariant(topic.id);

    await assertSearchRecordWithRetry(textToSearch, {
        codename: item.codename,
        content: `Some random text: ${textToSearch}.`,
        id: item.id,
        title,
    }, "Search published article");

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValuesFirstPublish = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValuesFirstPublish, expectedValues);

    await unpublishDefaultLanguageVariant(item.id);
    await assertSearchWithRetry(textToSearch, 0, "Search unpublished article");

    await driver.get(getWebUrl());
    let searchInput: WebElement = await driver.findElement(By.id(IdAttributes.Search));

    await typeIntoSearchInput(textToSearch, searchInput, driver);
    await assertNoSuggestions(driver);

    await publishDefaultLanguageVariant(item.id);
    await assertSearchWithRetry(textToSearch, 1, "Search once more published article");

    await driver.navigate().refresh();

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, textToSearch);

    const actualValuesSecondPublish = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValuesSecondPublish, expectedValues);
    await driver.get(getWebUrl());

    const updatedTextToSearch = randomize("test_8");
    const updatedArticleContent = `Some random text: ${updatedTextToSearch}.`;

    await createNewVersionOfDefaultLanguageVariant(item.id);
    await upsertDefaultLanguageVariant(item.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${updatedArticleContent}</p>`,
        },
    ]);

    await publishDefaultLanguageVariant(item.id);
    await assertSearchWithRetry(updatedTextToSearch, 1, "Search updated article");

    await waitForUrlMapCacheUpdate(driver, item.codename);
    await searchAndWaitForSuggestions(driver, updatedTextToSearch);
    expectedValues.content = updatedArticleContent;

    const actualValuesThirdPublish = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualValuesThirdPublish, expectedValues);
});

test("Saga: Search content of a hierarchical article using cascade publish", async () => {
    const calloutText = randomize("test_9");
    const title = randomize("title");
    const calloutContent = `Some random text in callout: ${calloutText}.`;
    const expectedValues = {
        heading: '',
        content: calloutContent,
        expectedUrl: getExpectedUrl(Types.Article, title)
    };

    const callout = await addContentItem(`Test 9 Callout (${calloutText})`, context.types.callout.codename);
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${calloutContent}</p>`,
        },
    ]);

    const contentChunkText = randomize("test_9");
    const contentChunkContent = `Some random text in content chunk: ${contentChunkText}.`;
    const contentChunk =
        await addContentItem(`Test 9 Content Chunk (${contentChunkText})`, context.types.content_chunk.codename);
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${contentChunkContent}</p>` +
                `<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"${callout.id}\"></object>`,
        },
    ]);

    const article = await addContentItem(`Test 9 article (8uw2u7qgww)`, context.types.article.codename);
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
            value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
                `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>`,
        },
    ]);

    const topic = await insertArticleToTopic(article, context);

    await setDefaultLanguageVariantToCascadePublishStep(article.id);
    await triggerPublisher();
    await publishDefaultLanguageVariant(topic.id);

    await assertSearchRecordWithRetry(calloutText, {
        codename: article.codename,
        content: `Some random text in callout: ${calloutText}.`,
        id: article.id,
        title: title,
    }, "Search by callout text should return a hit.");

    await assertSearchRecordWithRetry(contentChunkText, {
        codename: article.codename,
        content: `Some random text in content chunk: ${contentChunkText}.`,
        id: article.id,
        title: title,
    }, "Search by content chunk text should return a hit.");

    await waitForUrlMapCacheUpdate(driver, article.codename);
    await searchAndWaitForSuggestions(driver, calloutText);

    const actualCalloutValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    assertContentOnWeb(actualCalloutValues, expectedValues);

    await driver.get(getWebUrl());

    await waitForUrlMapCacheUpdate(driver, article.codename);
    await searchAndWaitForSuggestions(driver, contentChunkText);

    const actualContentChunkValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    expectedValues.content = contentChunkContent;

    assertContentOnWeb(actualContentChunkValues, expectedValues);

    await unpublishDefaultLanguageVariant(contentChunk.id);
    await assertSearchWithRetry(contentChunkText, 0, "Search by content chunk text shouldn't return a hit.");
    await assertSearchWithRetry(calloutText, 0, "Search by callout text shouldn't return a hit.");

    await driver.get(getWebUrl());
    let searchInput: WebElement = await driver.findElement(By.id(IdAttributes.Search));

    await typeIntoSearchInput(contentChunkText, searchInput, driver);
    await assertNoSuggestions(driver);

    await driver.navigate().refresh();
    searchInput = await driver.findElement(By.id(IdAttributes.Search));

    await typeIntoSearchInput(calloutText, searchInput, driver);
    await assertNoSuggestions(driver);
});

test.only("Saga: Search content of a hierarchical article using scheduled publish", async () => {
    const jsSearchText = randomize('javascript code sample');
    const rubySearchText = randomize('ruby code sample');
    const codeSampleCodename = randomize('test_codename').toLowerCase();
    const jsCodeSample =
        'const KenticoCloud = require(\'kentico-cloud-delivery\');\n' +
        '\n' +
        '// Create strongly typed models according to https://developer.kenticocloud.com/docs/strongly-typed-models\n' +
        'class Article extends KenticoCloud.ContentItem222 {\n' +
        '    constructor() {\n' +
        '        super();\n' +
        '    }\n' +
        '}\n' +
        `const deliveryClient = new ${jsSearchText}({\n` +
        '    projectId: \'975bf280-fd91-488c-994c-2f04416e5ee3\',\n' +
        '    typeResolvers: [\n' +
        '        new KenticoCloud.TypeResolver(\'article\', () => new Article())\n' +
        '    ]\n' +
        '});\n' +
        '\n' +
        'deliveryClient.item(\'on_roasts\')\n' +
        '    .queryConfig({ waitForLoadingNewContent: true })\n' +
        '    .getObservable()\n' +
        '    .subscribe(response => console.log(response));';

    const rubyCodeSample =
        'require \'delivery-sdk-ruby\'\n' +
        '\n' +
        'delivery_client = KenticoCloud::Delivery::DeliveryClient.new project_id: \'975bf280-fd91-488c-994c-2f04416e5ee3\'\n' +
        'delivery_client.item(\'on_roasts\')\n' +
        '               .request_latest_content\n' +
        '               .execute do |response|\n' +
        '                 item = response.item\n' +
        '               end\n' +
        `${rubySearchText}`;
    const rubyFileContent = `# DocSection: ${codeSampleCodename}\n` +
        rubyCodeSample +
        '# EndDocSection';
    const jsFileContent = `// DocSection: ${codeSampleCodename}\n` +
        jsCodeSample +
        '// EndDocSection';
    const expectedCodeSamples = [jsCodeSample, rubyCodeSample];

    await gitCommitPush([
        {
            content: rubyFileContent,
            path: 'ruby/GetLatestContent.rb'
        }
    ]);
    await gitCommitPush([
        {
            content: jsFileContent,
            path: 'js/GetLatestContent.js'
        }
    ]);

    const calloutText = randomize("test_10");
    const title = randomize("title");
    const calloutContent = `Some random text in callout: ${calloutText}.`;
    const expectedValues = {
        heading: '',
        content: calloutContent,
        expectedUrl: getExpectedUrl(Types.Article, title)
    };

    const callout = await addContentItem(`Test 10 Callout (${calloutText})`, context.types.callout.codename);
    await upsertDefaultLanguageVariant(callout.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${calloutContent}</p>`,
        },
    ]);

    const contentChunkText = randomize("test_10");
    const contentChunkContent = `Some random text in content chunk: ${contentChunkText}.`;
    const contentChunk =
        await addContentItem(`Test 10 Content Chunk (${contentChunkText})`, context.types.content_chunk.codename);
    await upsertDefaultLanguageVariant(contentChunk.id, [
        {
            element: {
                codename: "content",
            },
            value: `<p>${contentChunkContent}</p>` +
                `<object type=\"application/kenticocloud\" data-type=\"item\" data-id=\"${callout.id}\"></object>`,
        },
    ]);

    let codeSamplesItem: ViewContentItemResponse | null = null;

    while (codeSamplesItem === null) {
        try {
            codeSamplesItem = await getTestKenticoClient()
                .viewContentItem()
                .byItemCodename(codeSampleCodename)
                .toPromise();
        } catch (err) {
            codeSamplesItem = null;
            await driver.sleep(5000);
        }
    }

    const rubySample = await getTestKenticoClient()
        .viewContentItem()
        .byItemCodename(codeSampleCodename + '_ruby')
        .toPromise();
    const jsSample = await getTestKenticoClient()
        .viewContentItem()
        .byItemCodename(codeSampleCodename + '_js')
        .toPromise();

    const article = await addContentItem(`Test 10 article (8uw2u7qgww)`, context.types.article.codename);
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
            value: `<p>Some content: </p><object type=\"application/kenticocloud\" ` +
                `data-type=\"item\" data-id=\"${contentChunk.id}\"></object>` +
                `<object type=\"application/kenticocloud\" data-type=\"item\" ` +
                `data-id=\"${codeSamplesItem.data.id}\"></object>`,
        },
    ]);

    const topic = await insertArticleToTopic(article, context);

    await scheduleDefaultLanguageVariant(article.id);
    await triggerPublisher();
    await publishDefaultLanguageVariant(topic.id);

    await assertSearchRecordWithRetry(calloutText, {
        codename: article.codename,
        content: `Some random text in callout: ${calloutText}.`,
        id: article.id,
        title,
    }, "Search by callout text should return a hit.");

    await assertSearchRecordWithRetry(contentChunkText, {
        codename: article.codename,
        content: `Some random text in content chunk: ${contentChunkText}.`,
        id: article.id,
        title,
    }, "Search by content chunk text should return a hit.");

    await assertSearchRecordWithRetry(rubySearchText, {
        codename: article.codename,
        content: rubyCodeSample,
        id: article.id,
        title,
    });

    await assertSearchRecordWithRetry(jsSearchText, {
        codename: article.codename,
        content: jsCodeSample,
        id: article.id,
        title,
    });

    await waitForUrlMapCacheUpdate(driver, article.codename);
    await searchAndWaitForSuggestions(driver, rubySearchText); // calloutText

    const actualCalloutValues = {
        searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
        urlWithoutQuery: await getUrlWithoutQuery(driver),
        searchableContent: await getSearchableContent(driver)
    };

    const codeSamplesFromWeb = await driver.findElements(By.className('clean-code'));
    let cs = [];
    for (const codeSampleFromWeb of codeSamplesFromWeb) {
        let codeSampleText = await codeSampleFromWeb.getAttribute('textContent');
        codeSampleText = codeSampleText.replace(/\"/g, '\'');
        cs.push(codeSampleText);
    }

    assertCodeSamplesOnWeb(cs, expectedCodeSamples);

    // assertContentOnWeb(actualCalloutValues, expectedValues);

    await driver.get(getWebUrl());
    //
    // await waitForUrlMapCacheUpdate(driver, article.codename);
    // await searchAndWaitForSuggestions(driver, contentChunkText);
    //
    // const actualContentChunkValues = {
    //     searchSuggestionText: await getSearchSuggestionTextAndRedirect(driver),
    //     urlWithoutQuery: await getUrlWithoutQuery(driver),
    //     searchableContent: await getSearchableContent(driver)
    // };
    //
    // expectedValues.content = contentChunkContent;
    //
    // assertContentOnWeb(actualContentChunkValues, expectedValues);
    //
    // await unpublishDefaultLanguageVariant(contentChunk.id);
    // await assertSearchWithRetry(contentChunkText, 0, "Search by content chunk text shouldn't return a hit.");
    // await assertSearchWithRetry(calloutText, 0, "Search by callout text shouldn't return a hit.");
    //
    // await driver.get(getWebUrl());
    // let searchInput: WebElement = await driver.findElement(By.id(IdAttributes.Search));
    //
    // await typeIntoSearchInput(contentChunkText, searchInput, driver);
    // await assertNoSuggestions(driver);
    //
    // await driver.navigate().refresh();
    // searchInput = await driver.findElement(By.id(IdAttributes.Search));
    // await typeIntoSearchInput(calloutText, searchInput, driver);
    // await assertNoSuggestions(driver);
});
