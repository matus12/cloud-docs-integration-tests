import retry from "async-retry";
import { algoliaIndex } from "../external/algoliaClient";

interface ISearchRecord {
    content: string;
    id: string;
    title: string;
    codename: string;
}

export const assertSearchRecordWithRetry = async (
    textToSearch: string,
    expectedRecord: ISearchRecord,
    message = "",
) => {
    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect({ message, hits: searchResponse.hits.length }).toEqual({ message, hits: 1 });
        expectCorrectSearchRecord(searchResponse.hits[0], expectedRecord);
    });
};

export const assertSearchWithRetry = async (textToSearch: string, hits: number, message = "") => {
    await assertWithRetry(async () => {
        const searchResponse = await algoliaIndex.search(textToSearch);

        expect({ message, hits: searchResponse.hits.length }).toEqual({ message, hits });
    });
};

const assertWithRetry = async (assert: () => void) => {
    await retry(async () => {
        await assert();
    }, {
        retries: 8,
    });
};

const expectCorrectSearchRecord = (actual: any, expected: ISearchRecord) => {
    expect(actual.content).toEqual(expected.content);
    expect(actual.id).toEqual(expected.id);
    expect(actual.title).toEqual(expected.title);
    expect(actual.codename).toEqual(expected.codename);
};
