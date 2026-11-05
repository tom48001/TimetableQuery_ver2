// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential', 
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'curly': 'off',
    'no-multi-spaces': 'off',
    'semi': 'off',
    'indent': 'off',
    'generator-star-spacing': 'off',
    'no-debugger': 'off',
    'space-before-function-paren': 'off'
  }
}
