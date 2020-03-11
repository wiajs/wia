const loose = true;

const presets = [
  [
    '@babel/preset-env',
    {
			loose,
      targets: {
				// node: 'current' // ��ϵͳ��װ��node�汾��ΪĿ��
        browsers: [
          '>0.5%',
          'last 2 versions',
          'Firefox ESR',
          'not ie <= 8',
          'not dead',
        ], // defaults
			},
      // useBuiltIns: 'usage'
    },
  ],
];

const plugins = [
  ['@babel/plugin-proposal-class-properties', {loose}],
  ['@babel/plugin-proposal-private-methods', {loose}],
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