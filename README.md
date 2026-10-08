# BI 看板起步模板（GitHub 数据源）

一个**纯前端、零后端、零费用**的 BI 看板模板：数据放在 GitHub 仓库，浏览器直接拉取并用 ECharts 渲染，整体用 GitHub Pages 免费托管。

## 目录结构

```
.
├── index.html              # 看板页面（含布局与样式）
├── app.js                  # 拉取数据 + ECharts 渲染逻辑
├── data/
│   └── sales.json          # 数据源（换成你自己的数据即可）
├── .github/workflows/
│   └── update.yml          # 可选：定时自动更新数据
└── README.md
```

## 本地预览

由于浏览器对 `file://` 下的 `fetch` 有跨域限制，直接双击 `index.html` 会回退到内置示例数据（页面顶部有提示）。要看到真实数据，请用本地静态服务器：

```bash
# 任选一种，在仓库根目录执行
python -m http.server 8080
# 或
npx serve .
```

然后访问 `http://localhost:8080`。

## 部署到 GitHub Pages

1. 把整个文件夹推送到一个 GitHub 仓库。
2. 仓库 **Settings → Pages → Source** 选择 `main` 分支、`/root` 目录，保存。
3. 几分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`。

部署后，看板会自动读取仓库里的 `data/sales.json`（通过 raw 链接，已带 CORS 头，无需后端）。

## 换成你自己的数据

编辑 `data/sales.json`，保持以下字段结构即可，图表与 KPI 会自动适配：

- `updated`：数据更新时间（字符串，会显示在页面顶部）
- `monthly`：`[{ "month": "1月", "sales": 128, "profit": 32 }, ...]`
- `categories`：`[{ "name": "酱油", "value": 420 }, ...]`（饼图）
- `regions`：`[{ "name": "华东", "value": 480 }, ...]`（柱状图）

## 定时自动更新（可选）

`.github/workflows/update.yml` 已配置：每天北京时间 09:00 自动运行。
在文件中标注的「接入点」处填入你自己的数据抓取逻辑（Node 脚本 / curl 等），
脚本把最新数据写入 `data/sales.json` 后，GitHub Pages 会自动重建并上线新数据。

> 注意：私有仓库的数据无法被浏览器直接 `fetch`；若需私有，请改用 GitHub API + token 并加一个轻量代理，或保持仓库公开。
