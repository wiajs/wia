module.exports = {
  root: true, // 停止父目录查找配置
  parser: "babel-eslint", // "typescript-eslint-parser", "babel-eslint",
  env: {
    es6: true,
    es2017: true,
    es2020: true,
    browser: true,  // 浏览器环境中的全局变量
    node: true,
    commonjs: true,
    mongo: true,
    jest: true,
    jquery: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [ // 插件，需安装好，配置时省略 eslint-plugin-
    html,
    babel, 
    react,
    graphql,
  ],
  extends: [ // 继承规则
    'airbnb' // 'eslint:recommended'
    //'plugin:vue/essential',
    //'@vue/airbnb'
  ],
  rules: {
    // Disable for console/alert
		// 0 关闭 1 警告 2 报错 https://eslint.org/docs/rules/  中文网址：http://eslint.cn/docs/rules/
    // "arrow-parens": [2, "as-needed"],
		"arrow-parens": [2, "as-needed", {requireForBlockBody: false}],
    "arrow-body-style": [2, "as-needed"],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "quotes": [1, "single"],
    "no-alert": 0,
    "no-trailing-spaces": 0,
    "nonblock-statement-body-position": 0, //[2, "beside"], // if else 强制单行
    "block-spacing": 0, // 对象空格
    "function-paren-newline": 0, // 函数参数换行
    "linebreak-style": 0,
    "lines-between-class-members": 0,
    "class-methods-use-this": 0,
    "indent": [2, 2, {"SwitchCase": 1}],
    "object-curly-spacing": 0,
    "no-plusplus": 0,
    "no-multi-spaces": 0,
    "no-trailing-spaces": 0,
    "no-param-reassign": [0, {props: false }],
    "no-param-reassign": ["warn", { "props": false }],
    "no-use-before-define": [2, { "functions": false, "classes": true }],
    "no-unused-expressions": ["error", { "allowShortCircuit": true }],
    "no-underscore-dangle": 0,
    "no-unused-vars": [0, { "vars": "local", "args": "after-used" }],
    "operator-linebreak": 0,		
    "generator-star-spacing": 0,
    // if while function 后面的{必须与if在同一行，java风格。
    // "brace-style": [2, "1tbs", { "allowSingleLine": true }]

    // 数组和对象键值对最后一个逗号， never 参数：不能带末尾的逗号, always参数：必须带末尾的逗号，
    // always-multiline：多行模式必须带逗号，单行模式不能带逗号
    "comma-dangle": [2, "only-multiline"],
    // 控制逗号前后的空格
    "comma-spacing": [2, { "before": false, "after": true }],
    // 控制逗号在行尾出现还是在行首出现
    // http://eslint.org/docs/rules/comma-style
    "comma-style": [0, "last"],
    "max-len": [2, 120, 2],
    "curly": [0, "multi"], // 单行无需大括号
    // 强制方法必须返回值，TypeScript强类型，不配置
    "consistent-return": 0,
    "object-curly-newline": 0,
    "semi": 0, // 分号检查
    "space-before-function-paren": 0, // ["error", "never"]
		"func-names": ["error", "never"]
  },
  "plugins": [
    "import"
  ],
  "settings": {
    "import/parser": "babel-eslint",
    "import/resolve": {
      "moduleDirectory": ["node_modules", "src"]
    }
  },
  "globals": {
    "__DEV__": true,
    "__OPTION__": true,
    "window": true,
    "document": true,
    "Dom": true,
    "$": true
  }
}
