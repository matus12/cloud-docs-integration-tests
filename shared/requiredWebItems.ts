import { NO_RESULTS } from "./constants";

export const author = [
    {
        element: {
            codename: 'name'
        },
        value: 'name'
    },
];

export const footer = [
    {
        element: {
            codename: 'copyright'
        },
        value: '<p>copyright</p>'
    }
];

export const topic = [
    {
        element: {
            codename: 'title'
        },
        value: 'topic'
    }
];

export const scenario = [
    {
        element: {
            codename: 'title'
        },
        value: 'scenario'
    },
    {
        element: {
            codename: 'children'
        },
        value: [
            {
                codename: 'topic'
            }
        ]
    }
];

export const navigation_item = [
    {
        element: {
            codename: 'title'
        },
        value: 'tutorials'
    },
    {
        element: {
            codename: 'children'
        },
        value: [
            {
                codename: 'scenario'
            }
        ]
    }
];

export const home = [
    {
        element: {
            codename: 'title'
        },
        value: 'home'
    },
    {
        element: {
            codename: 'navigation'
        },
        value: [
            {
                codename: 'navigation_item'
            }
        ]
    }
];

export const uiMessages = [
    {
        element: {
            codename: 'search___placeholder'
        },
        value: 'placeholder'
    },
    {
        element: {
            codename: 'search___no_results'
        },
        value: NO_RESULTS
    }
];
