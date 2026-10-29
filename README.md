# 观复文明 · 分幕放映展示页

星际废土"哲人王"文明设定《观复文明》的动态展示页——以柴尔德"城市革命"十条标准为基石，**点击分幕放映**：15 幕全屏场景（序 → 时间线 → 先纪 → 大寂灭 → 制度 → 王权 → 宗教 → 十条 → 裂缝 → 故事 → 外部 → 短篇三幕 → 结语），每点一次自动播放当前幕的 GSAP 入场动画，three.js 三维背景（恒星辉煌 → 大寂灭崩溃 → 单点光柱重建）随幕平滑过渡。

## 交互方式

- **下一幕 / 重新开始**：底部中央按钮
- **点击空白处**：直接推进下一幕
- **键盘**：`→` / `空格` / `回车` 下一幕，`←` 上一幕
- **手机**：向左滑动前进，向右滑动后退
- 幕 4 可点击"重演级联"观看九执堂逐环熄灭；幕 8 点击卡片查看十条细节

## 文件结构

```
guanfu-demo/
├── index.html              # 页面主体（15 幕结构 + 全部章节内容）
├── assets/
│   ├── css/
│   │   └── style.css       # 全部样式（全屏幕式布局 / 金色主题 / 响应式）
│   └── js/
│       ├── three-scene.js  # three.js 三维背景（恒星 / 戴森云环 / 崩溃 / 重建光柱）
│       └── main.js         # 分幕主控（切换 / 动画 / 级联 / 十条展开）
└── README.md
```

依赖两个开源库（CDN 经 jsDelivr 引入，无需安装）：[three.js](https://github.com/mrdoob/three.js)、[GSAP + ScrollTrigger](https://github.com/greensock/GSAP)。

## 本地预览

直接双击打开 `index.html` 即可（需要网络加载 CDN 库）。推荐用 VS Code 的 Live Server 或 `python3 -m http.server` 预览。

## 部署到 GitHub Pages（约 3 分钟）

1. **建仓库**：登录 GitHub → New repository → 仓库名如 `guanfu-civilization` → Public → Create。
2. **上传文件**（二选一）：
   - 网页方式：仓库页 → Add file → Upload files → 把 `index.html` 和整个 `assets/` 文件夹拖入（assets 会保留目录结构）→ Commit。
   - 命令行方式：
     ```bash
     cd guanfu-demo
     git init && git add index.html assets && git commit -m "观复文明展示页"
     git branch -M main
     git remote add origin https://github.com/<你的用户名>/<仓库名>.git
     git push -u origin main
     ```
3. **启用 Pages**：仓库 → Settings → Pages → Build and deployment → Source 选 **Deploy from a branch** → Branch 选 `main` + `/ (root)` → Save。
4. **等待 1–2 分钟**，刷新页面看到绿色提示 "Your site is live at …"。
5. **访问**：`https://<你的用户名>.github.io/<仓库名>/`

## 注意

- 页面依赖 jsDelivr CDN，部署后请确认浏览器能访问 `fastly.jsdelivr.net`（国内一般可直连，必要时可自行替换为 cdnjs 镜像）。
- three.js 加载失败时页面会自动降级为 CSS 星空背景，内容不受影响。
- 章节内容为虚构设定，仅供展示与课堂演示使用。

> 构建基石：戈登·柴尔德（V. Gordon Childe）"城市革命"十条标准
> 状态：多文件工程版 · 2026-10-29
