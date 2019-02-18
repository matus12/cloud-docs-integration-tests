[![Build Status](https://travis-ci.com/Kentico/kentico-cloud-docs-integration-tests.svg?branch=master)](https://travis-ci.com/Kentico/kentico-cloud-docs-integration-tests)
[![codebeat badge](https://codebeat.co/badges/260d7081-910a-430f-a59b-fc6de2c998c4)](https://codebeat.co/projects/github-com-kentico-kentico-cloud-docs-integration-tests-master)

# Kentico Cloud Documentation - Integration Tests
Integration tests for Kentico Cloud documentation portal, which utilizes [Kentico Cloud](https://app.kenticocloud.com/) as a source of its content.

The service is responsible for testing the integration between [Dispatcher](https://github.com/Kentico/kentico-cloud-docs-dispatcher), [Search Service](https://github.com/Kentico/kentico-cloud-docs-search), [Github Sync Service](https://github.com/Kentico/kentico-cloud-docs-github-sync) and [Web Service](https://github.com/Kentico/kentico-cloud-docs-web).

## Overview
Tests copy selected content types from live Kentico Cloud project to a test Kentico Cloud project. Afterwards, content items are created in the test project and filled with content. This is all done using [Kentico Cloud Content management JavaScript SDK](https://github.com/Kentico/kentico-cloud-js/tree/master/packages/content-management).

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
* `OHP_LIVE_CM_API_KEY` - Content management API key of live Kentico Cloud project
* `OHP_LIVE_PROJECT_ID` - Project ID of live Kentico Cloud project
* `OHP_TEST_CM_API_KEY` - Content management API key of test Kentico Cloud project
* `OHP_TEST_PROJECT_ID` - Project ID of test Kentico Cloud project

## How To Contribute

Feel free to open a new issue where you describe your proposed changes, or even create a new pull request from your branch with proposed changes.



## Licence

All the source codes are published under MIT licence.
