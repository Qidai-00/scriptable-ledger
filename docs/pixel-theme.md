# 程序员像素主题

这是本地账本 v2.1.4 的界面主题，不是存储迁移。深色终端面板、方角和像素感边框，配薄荷绿、琥珀色与等宽数字；中文仍使用系统字体。覆盖账本、账户、统计、分类明细及新增、编辑、设置界面。

## 在 iPhone 上使用

1. 在原账本的设置里先导出一份 JSON 备份，留在自己设备上。
2. 将 `scriptable/local/Qidai-Ledger-v2.1.4-pixel.js` 全文复制到 **原来的本地账本脚本**，不要改 Scriptable 中的脚本名，不替换 AI 识别脚本。
3. 先打开账本，核对现有账单；走一遍分类明细、账单编辑和快捷指令的确认／取消。需要回退时，恢复替换前的脚本内容，不需要导入或清空账本。
4. 如果你的手机正在用 iCloud 备份方案，不要用本文件覆盖它。iCloud 方案和本地方案各自保留；手机上具体正在使用哪版，尚未核对。

主题不引入外部字体、图片或网络依赖。仓库不会自动同步到 Scriptable。不要把密钥、账单数据或截图提交到公开仓库。

## 维护主题

修改 `themes/programmer-pixel.css`，然后在仓库根目录运行：

```sh
node tools/build-pixel.cjs scriptable/local/Qidai-Ledger-v2.1.4.js themes/programmer-pixel.css scriptable/local/Qidai-Ledger-v2.1.4-pixel.js
```

同一命令末尾加 `--check` 可以验证生成文件是否与源代码和主题一致。保留历史导入文件以及对应版本的存储模式。
