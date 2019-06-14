import axios from 'axios';
import retry from "async-retry";
import {
    By,
    Locator,
    WebDriver,
    WebElement
} from "selenium-webdriver";
import {
    PUBLISHED_ID,
    WEB_URL
} from "./projectSettings";
import {
    createNewVersionOfDefaultLanguageVariant,
    upsertDefaultLanguageVariant,
    viewDefaultLanguageVariant
} from "./kenticoCloudHelper";
import { ContentItemModels } from "kentico-cloud-content-management";
import { IEnvironmentContext } from "./testEnvironment";
import {
    ClassAttributes,
    IdAttributes,
    NO_RESULTS,
    searchRetryTimeout,
    Types,
    urlMapCheckTimeout
} from "./constants";
import ContentItem = ContentItemModels.ContentItem;

interface IActualValues {
    readonly searchableContent: {
        readonly contentFromParagraphs: string[];
        readonly headingText: string;
    };
    readonly urlWithoutQuery: string;
    searchSuggestionText: string;
}

interface IExpectedValues {
    readonly content: string;
    readonly heading: string;
    readonly expectedUrl: string;
}

interface ISearchableContent {
    readonly contentFromParagraphs: string[];
    readonly headingText: string;
}

export const getExpectedUrl = (contentType: string, title: string, heading?: string): string => {
    const urlSlug = title
        .replace(/_/g, '-')
        .toLowerCase();
    const fragment = heading
        ? `#a-${heading.toLowerCase()}`
        : '';

    if (contentType === Types.Article) {
        return `${WEB_URL}/tutorials/scenario/topic/${urlSlug}${fragment}`;
    } else if (contentType === Types.Scenario) {
        return `${WEB_URL}/tutorials/${urlSlug}${fragment}`;
    }

    return '';
};

export const insertScenarioToNavigationItem =
    async (item: ContentItem, context: IEnvironmentContext): Promise<ContentItem> =>
        insertItemIntoParent(item, 'navigation_item', context);

export const insertArticleToTopic =
    async (item: ContentItem, context: IEnvironmentContext): Promise<ContentItem> =>
        insertItemIntoParent(item, 'topic', context);

const insertItemIntoParent =
    async (item: ContentItem, parentItemCodename: string, context: IEnvironmentContext): Promise<ContentItem> => {
        const parentItem = context.items.find((item: ContentItem) => item.codename === parentItemCodename);

        if (parentItem === undefined) {
            throw new Error(`Couldn\'t find the parent item ${parentItemCodename}`);
        }

        const parentItemVariant = await viewDefaultLanguageVariant(parentItem.id);

        if (parentItemVariant.data.workflowStep.id === PUBLISHED_ID) {
            await createNewVersionOfDefaultLanguageVariant(parentItem.id);
        }

        await upsertDefaultLanguageVariant(parentItem.id, [
            {
                element: {
                    codename: 'children',
                },
                value: [
                    {
                        codename: item.codename
                    }
                ]
            }
        ]);

        return parentItem;
    };

export const typeIntoSearchInput = async (text: string, searchInput: WebElement, driver: WebDriver): Promise<void> => {
    for (const key of text) {
        await searchInput.sendKeys(key);
        await driver.sleep(150);
    }
};

export const findElementWithRetry = async (driver: WebDriver, locator: Locator): Promise<WebElement> =>
    await retry(
        async () => await driver.findElement(locator),
        { retries: 5 }
    );

export const searchAndWaitForSuggestions = async (driver: WebDriver, textToSearch: string): Promise<void> => {
    let searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));
    await driver.wait(async () => {
        try {
            await typeIntoSearchInput(textToSearch, searchInput, driver);

            await findElementWithRetry(driver, By.className(ClassAttributes.SuggestionText));
        } catch {
            await driver.sleep(searchRetryTimeout);
            await driver.navigate().refresh();

            searchInput = await findElementWithRetry(driver, By.id(IdAttributes.Search));

            return false;
        }

        return true;
    });
};

export const waitForUrlMapCacheUpdate = async (driver: WebDriver, articleCodename: string): Promise<void> => {
    await driver.wait(async () => {
        const response = await axios.get(`${WEB_URL}/urlmap`);
        const urlMap = JSON.stringify(response.data);

        if (urlMap.includes(articleCodename)) {
            await driver.navigate().refresh();

            return true;
        } else {

            await driver.sleep(urlMapCheckTimeout);

            return false;
        }
    });
};

export const getSearchSuggestionTextAndRedirect = async (driver: WebDriver): Promise<string> => {
    const textElement = await findElementWithRetry(driver, By.className(ClassAttributes.SuggestionText));
    const searchSuggestionText = await textElement.getText();

    await textElement.click();

    await driver.sleep(15000);

    return searchSuggestionText;
};

export const getSearchableContent = async (driver: WebDriver): Promise<ISearchableContent> => {
    const articleParagraphs = await driver.findElements(By.css('p'));
    const articleHeadings = await driver.findElements(By.css('h2'));
    const contentFromParagraphs: string[] = [];

    for (const paragraph of articleParagraphs) {
        contentFromParagraphs.push(await paragraph.getText());
    }

    const headingText = (articleHeadings[1]) ? await articleHeadings[1].getText() : '';

    return {
        contentFromParagraphs,
        headingText
    };
};

export const assertContentOnWeb = (actual: IActualValues, expected: IExpectedValues): void => {
    actual.searchSuggestionText = actual.searchSuggestionText.replace(/…/g, '');

    expect(expected.content).toContain(actual.searchSuggestionText);
    // expect(actual.searchableContent.contentFromParagraphs).toContain(expected.content);
    expect(actual.searchableContent.headingText).toEqual(expected.heading);
    expect(actual.urlWithoutQuery).toEqual(expected.expectedUrl);
};

export const assertNoSuggestions = async (driver: WebDriver): Promise<void> => {
    let suggestionHeading = '';
    const suggestionHeadingElement =
        await findElementWithRetry(driver, By.className(ClassAttributes.SuggestionHeading));

    try {
        suggestionHeading = await suggestionHeadingElement.getText();
    } catch (error) {
        await assertNoSuggestions(driver);

        return;
    }

    expect(suggestionHeading).toEqual(NO_RESULTS);
};
