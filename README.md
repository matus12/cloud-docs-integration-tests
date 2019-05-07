[![Build Status](https://travis-ci.com/Kentico/kentico-cloud-docs-integration-tests.svg?branch=master)](https://travis-ci.com/Kentico/kentico-cloud-docs-integration-tests)
[![codebeat badge](https://codebeat.co/badges/260d7081-910a-430f-a59b-fc6de2c998c4)](https://codebeat.co/projects/github-com-kentico-kentico-cloud-docs-integration-tests-master)

# Kentico Cloud Documentation - Integration Tests
Integration tests for Kentico Cloud [documentation portal](https://docs.kenticocloud.com/), which utilizes Kentico Cloud as a source of its content.

The service is responsible for testing the integration between various [Kentico Cloud Documentation services](https://github.com/Kentico?utf8=✓&q=kentico-cloud-docs).

## Overview
Tests copy selected content types from live Kentico Cloud project to a testing Kentico Cloud project. Afterwards, content items are created in the test project and filled with content. This is all done using [Kentico Cloud Content management JavaScript SDK](https://github.com/Kentico/kentico-cloud-js/tree/master/packages/content-management).

The tests then check whether the created content items have been indexed on Algolia, which is used for search functionality on Kentico Cloud Documentation.

## Setup

### Prerequisites
1. Node (+yarn) installed
2. Subscriptions on Kentico Cloud

### Instructions
1. Clone the project repository.
2. Run `yarn install` in the terminal.
3. Create `.env` file and set the required keys there.
4. Run the tests using `yarn test`.

#### Required Keys
* `LIVE_CM_API_KEY` - Content management API key of live Kentico Cloud project
* `LIVE_PROJECT_ID` - Project ID of live Kentico Cloud project
* `TEST_CM_API_KEY` - Content management API key of test Kentico Cloud project
* `TEST_SECURED_API_KEY` - Secured Delivery API key of test Kentico Cloud project
* `TEST_PROJECT_ID` - Project ID of test Kentico Cloud project
* `SEARCH_APP_ID` - Algolia application ID
* `SEARCH_API_KEY` - Algolia admin API key
* `SEARCH_INDEX_NAME` - Index name in Algolia application
* `CASCADE_PUBLISH_ID` - Cascade Publish workflow step ID (test KC project)
* `PUBLISHED_ID` - Publish workflow step ID (test KC project)
* `PUBLISHER_TRIGGER_URL` - Trigger endpoint of the [Publisher Service](https://github.com/Kentico/kentico-cloud-docs-publisher)
* `WEB_URL` - URL of the deployed [web instance](https://github.com/Kentico/kentico-cloud-docs-web)

## How To Contribute

Feel free to open a new issue where you describe your proposed changes, or even create a new pull request from your branch with proposed changes.

## Licence

All the source codes are published under MIT licence.
