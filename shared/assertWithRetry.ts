import retry from "async-retry";

export const assertWithRetry = async (assert: () => void) => {
    await retry(async () => {
        await assert();
      }, {
        retries: 8,
      });
};
