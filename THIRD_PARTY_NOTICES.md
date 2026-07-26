# 第三方开源声明

纸舟 Studio 使用以下主要开源组件。发行、销售或部署本应用时，请保留本文件及 `LICENSES` 目录。

## pdfme

- 项目：https://github.com/pdfme/pdfme
- 使用版本：`@pdfme/common`、`@pdfme/generator`、`@pdfme/schemas`、`@pdfme/ui` 6.1.12
- 许可证：MIT
- 版权所有：Copyright (c) 2020 HandDot
- 许可全文：`LICENSES/pdfme-MIT.txt`

MIT 许可证允许使用、复制、修改、合并、发布、分发、再许可和销售软件副本，条件是在软件的全部副本或实质性部分中包含原版权声明和许可声明。

## Noto Sans CJK

- 项目：https://github.com/notofonts/noto-cjk
- 文件：`public/fonts/NotoSansCJKsc-Regular.otf`
- 许可证：SIL Open Font License 1.1
- 许可全文：`LICENSES/NotoSansCJK-OFL.txt`

字体仅作为文档渲染资源分发。请勿单独以字体本身作为主要商品出售。

## JavaScript 依赖

应用还通过 npm 使用 React、Vite 及 pdfme 的传递依赖。构建产物中可能包含这些组件的代码。对外发行前，建议在锁定版本后运行一次完整的软件物料清单与许可证审计，并把结果随发行物保存。

本文件是工程合规记录，不构成法律意见。
