# Change Log

## 2020-04-06

- \* util/wiamap.js
  rename wiafile.js
  用于存放本地编译和编译后向 wia 服务器发布文件。
  exports = {build, builded, pub, pubed}
  remove last.
  build building 存放到 local 下面
  pub pubing 存放到 wia 下面

- \* util/pages.js
  rename wiapage.js
  自动处理编译、发布时 page 目录下的页面代码
- \+ wiaconfig.js
  wia 相关配置从 src/config/app.js 中移到 wiaconfig.js 中
  包含、排除文件
  exclude 支持 \*.map
  保存登录 token
