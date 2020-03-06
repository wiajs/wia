const presets = [
  [
    '@babel/env',
    {
      targets: {node: 'current'},
      // useBuiltIns: 'usage'
    },
  ],
];

const plugins = [
  ['@babel/plugin-proposal-class-properties', {loose: true}],
  ['@babel/plugin-proposal-private-methods', {loose: true}],
  ['@babel/plugin-proposal-function-bind'],
  ['@babel/plugin-proposal-nullish-coalescing-operator'],
  ['@babel/plugin-proposal-optional-chaining'],
];

module.exports = {presets, plugins};

// "plugins": [
//   "syntax-object-rest-spread",
//   "transform-object-rest-spread",
//   "transform-strict-mode"
// ]
