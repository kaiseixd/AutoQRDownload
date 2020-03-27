实在转不来二维码所以写了自动到 [acpatterns](https://acpatterns.com/) 下载二维码的脚本

### 使用方法
1. `$ npm install`
2. 去[淘宝镜像](https://npm.taobao.org/mirrors/chromium-browser-snapshots/)下载对应平台的 **722234** 版本 chromium， 解压放到 `/chrome` 目录下，脚本会按 `./chrome/chrome.exe` 这个地址去找
3. 将要转的图片放到 `/images` 目录下
4. `$ node index.js`