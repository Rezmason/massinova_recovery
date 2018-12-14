module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2018
  },
  rules: {
    // indent: ["error", 2],
    // "linebreak-style": ["error", "unix"],
    // quotes: ["error", "double"],
    // semi: ["error", "always"]
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-unused-vars": [
      "error",
      { vars: "all", args: "none", ignoreRestSiblings: false }
    ],
    "no-console": "off",
    "no-debugger": "off"
  }
};
