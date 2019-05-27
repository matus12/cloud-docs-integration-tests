import retry from "async-retry";
import { algoliaIndex } from "../external/algoliaClient";

interface ISearchRecord {
    readonly content: string;
    readonly id: string;
    readonly title: string;
    readonly codename: string;
}

export const assertSearchRecordWithRetry = async (
    textToSearch: string,
    expectedRecord: ISearchRecord,
    message = "",
): Promise<void> => {
    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search<ISearchRecord>(textToSearch);

        expect({ message, hits: searchResponse.hits.length }).toEqual({ message, hits: 1 });
        expectCorrectSearchRecord(searchResponse.hits[0], expectedRecord);
    });
};

export const assertSearchWithRetry = async (textToSearch: string, hits: number, message = ""): Promise<void> => {
    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search<ISearchRecord>(textToSearch);

        expect({ message, hits: searchResponse.hits.length }).toEqual({ message, hits });
    });
};

const assertWithRetry = async (assert: () => void): Promise<void> => {
    await retry(async () => {
        await assert();
    }, {
        retries: 8,
    });
};

const expectCorrectSearchRecord = (actual: ISearchRecord, expected: ISearchRecord): void => {
    const actualContent = actual.content.replace(/\s/g, '');
    const expectedContent = expected.content.replace(/\s/g, '');
    expect(actualContent).toEqual(expectedContent);
    expect(actual.id).toEqual(expected.id);
    expect(actual.title).toEqual(expected.title);
    expect(actual.codename).toEqual(expected.codename);
};
