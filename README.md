<p align="center">
  <img src="public/icons/paperflow.svg" width="84" alt="纸舟 PaperFlow Studio" />
</p>

<h1 align="center">纸舟 PaperFlow Studio</h1>

<p align="center">
  在浏览器里设计模板，用 CSV 一次生成整批 PDF。
</p>

<p align="center">
  <a href="https://zhang-ylong.github.io/paperflow-studio/"><strong>在线试用</strong></a>
  ·
  <a href="https://github.com/Zhang-YLong/paperflow-studio/releases"><strong>下载本地版</strong></a>
  ·
  <a href="https://github.com/Zhang-YLong/paperflow-studio/issues"><strong>反馈问题</strong></a>
</p>

<p align="center">
  <a href="https://github.com/Zhang-YLong/paperflow-studio/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Zhang-YLong/paperflow-studio/actions/workflows/ci.yml/badge.svg" /></a>
  <img alt="Public Beta" src="https://img.shields.io/badge/release-public_beta-DFFF4F?style=flat-square&labelColor=11130F" />
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-F5F2E9?style=flat-square&labelColor=11130F" />
</p>

![纸舟工作台](docs/assets/home.png)

## 关于这个项目

纸舟是我正在维护的一款本地 PDF 工具。

我做它时只想先解决一件事：同一类报价单、证书或标签，不应该每次都重新复制和排版。模板设计一次，之后换数据就够了。

当前版本还在 Beta，功能不算多，但主流程已经可以完整使用：

- 在可视化画布里调整文字、图片、表格、二维码、签名和形状
- 使用商业报价单、结业证书、发货标签三套内置模板
- 粘贴或导入 CSV，一行数据生成一页 PDF
- 保存自己的模板，也可以导出 JSON 留作备份
- 使用内置中文字体，不依赖在线字体服务

<table>
  <tr>
    <td width="50%"><img src="docs/assets/designer.png" alt="纸舟模板设计器" /></td>
    <td width="50%"><img src="docs/assets/pdf-output.png" alt="纸舟批量生成页面" /></td>
  </tr>
  <tr>
    <td align="center">模板设计</td>
    <td align="center">批量生成</td>
  </tr>
</table>

## 直接试用

打开 [在线版](https://zhang-ylong.github.io/paperflow-studio/) 就能使用。模板编辑、CSV 解析和 PDF 生成都在浏览器本地完成。

Windows 本地版：

1. 在 [Releases](https://github.com/Zhang-YLong/paperflow-studio/releases) 下载 ZIP 并解压。
2. 安装 [Node.js 20.19 或更高版本](https://nodejs.org/)。
3. 双击 `启动纸舟Studio.cmd`。

本地版当前仍依赖 Node.js，这是这个早期版本的一个已知限制。

## 本地开发

```bash
git clone https://github.com/Zhang-YLong/paperflow-studio.git
cd paperflow-studio
npm ci
npm run dev
```

提交前运行：

```bash
npm test
npm run build
```

## 数据保存在哪里

- 当前版本没有账号、埋点或纸舟后端服务。
- 模板默认保存在浏览器的 `localStorage` 中。
- 清除浏览器站点数据会同时清除本地修改。
- 重要模板建议使用“导出模板”保存一份 JSON 备份。

## 开源说明

纸舟 Studio 使用 [MIT License](LICENSE)。

PDF 相关能力基于 [pdfme](https://github.com/pdfme/pdfme) `6.1.12`，中文字体为 Noto Sans CJK。对应的版权和许可证文本保存在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 与 [LICENSES](LICENSES)。

## 反馈

如果你在实际使用中遇到问题，请直接创建 [Issue](https://github.com/Zhang-YLong/paperflow-studio/issues)。能复现的步骤、浏览器版本和脱敏后的示例，比一句“不能用”更容易定位。

如果纸舟刚好帮你省下了一些重复操作，欢迎给这个仓库一个 Star。
