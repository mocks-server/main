module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ["prettier", "@nrwl/nx"],
  extends: ["prettier"],
  rules: {
    "prettier/prettier": [
      2,
      {
        printWidth: 99,
        parser: "flow",
      },
    ],
    "no-shadow": [2, { builtinGlobals: true, hoist: "all" }],
    "no-undef": 2,
    "no-unused-vars": [2, { vars: "all", args: "after-used", ignoreRestSiblings: false }],
    // TODO, this plugin seems to not be working
    "@nrwl/nx/enforce-module-boundaries": [
      2,
      {
        allow: [],
        depConstraints: [
          {
            sourceTag: "type:app",
            onlyDependOnLibsWithTags: ["type:lib"],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["packages/*/test/*.js", "test/*/src/*.js"],
      globals: {
        jest: true,
        beforeAll: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
        describe: true,
        expect: true,
        it: true,
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
  ],
};
