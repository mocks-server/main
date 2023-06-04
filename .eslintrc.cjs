module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  ignorePatterns: ["node_modules/**/*"],
  plugins: ["prettier", "@nrwl/nx"],
  extends: ["eslint:recommended", "prettier", "plugin:json/recommended"],
  rules: {
    "prettier/prettier": [
      2,
      {
        printWidth: 99,
        parser: "flow",
      },
    ],
    camelcase: [2, { properties: "never" }],
    "no-console": [2, { allow: ["warn", "error"] }],
    "no-shadow": [2, { builtinGlobals: true, hoist: "all" }],
    "no-undef": 2,
    "no-unused-vars": [2, { vars: "all", args: "after-used", ignoreRestSiblings: false }],
    "@nrwl/nx/enforce-module-boundaries": [
      2,
      {
        allow: [],
        depConstraints: [
          {
            sourceTag: "type:mock",
            onlyDependOnLibsWithTags: ["type:lib"],
          },
          {
            sourceTag: "type:lib",
            onlyDependOnLibsWithTags: ["type:lib", "type:mock"],
          },
          {
            sourceTag: "type:app",
            onlyDependOnLibsWithTags: ["type:lib"],
          },
          {
            sourceTag: "type:test",
            onlyDependOnLibsWithTags: ["type:lib", "type:app", "type:mock", "type:specs"],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["packages/*/test/**/*.js", "test/*/src/**/*.js"],
      env: {
        node: true,
        es6: true,
      },
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        jest: true,
        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
        describe: true,
        expect: true,
        it: true,
        fetch: false,
      },
      plugins: ["jest", "no-only-tests", "jest-formatting"],
      extends: ["plugin:jest/recommended"],
      rules: {
        "jest/no-conditional-expect": [0],
        "no-only-tests/no-only-tests": [2],
        "jest/no-done-callback": [0],
      },
    },
    {
      files: ["test/*/cypress/**/*.js"],
      globals: {
        Cypress: true,
        cy: true,
        before: true,
        beforeEach: true,
        afterEach: true,
        after: true,
        describe: true,
        expect: true,
        it: true,
      },
      plugins: ["no-only-tests"],
      rules: {
        "no-only-tests/no-only-tests": [2],
      },
    },
    {
      files: ["scripts/**/*.js", "**/*.mjs"],
      parser: "@babel/eslint-parser",
      parserOptions: {
        sourceType: "module",
        allowImportExportEverywhere: true,
        requireConfigFile: false,
      },
      globals: {
        module: true,
      },
    },
    {
      files: ["packages/**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["prettier", "@typescript-eslint", "import"],
      extends: [
        "eslint:recommended",
        "prettier",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      rules: {
        "@typescript-eslint/member-ordering": "error",
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          { overrides: { constructors: "no-public" } },
        ],
        "import/no-relative-packages": [2],
        "@typescript-eslint/no-unused-vars": [2],
        "@typescript-eslint/no-shadow": "error",
        "no-shadow": "off",
        "prettier/prettier": [
          2,
          {
            printWidth: 99,
            parser: "typescript",
          },
        ],
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            pathGroups: [
              {
                pattern: "../**/*.types",
                group: "parent",
                position: "after",
              },
              {
                pattern: "./*.types",
                group: "sibling",
                position: "after",
              },
              {
                pattern: "**/*.types",
                group: "internal",
                position: "after",
              },
            ],
            "newlines-between": "always",
            alphabetize: {
              order: "asc" /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */,
              caseInsensitive: true /* ignore case. Options: [true, false] */,
            },
          },
        ],
      },
      settings: {
        "import/resolver": {
          typescript: true,
          node: true,
        },
      },
    },
  ],
};
