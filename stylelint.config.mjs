export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-css-modules'],
  ignoreFiles: ['build/**', 'dist/**', 'node_modules/**'],
  rules: {
    'selector-class-pattern': null,
    'scss/dollar-variable-pattern': null,
  },
}
