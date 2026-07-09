module.exports = {

    testEnvironment: "jsdom",

    testMatch: [
        "**/tests/**/*.test.js"
    ],

    setupFilesAfterEnv: [
        "<rootDir>/tests/setupTests.js"
    ],

    collectCoverageFrom: [

        "js/**/*.js",

        "!js/presentation/**"

    ]

};