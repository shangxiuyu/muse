# 图片风格预览

15 张由原生 imagegen 生成的风格示意图，使用同一主题「让想法开花」方便对比不同画法。不是 baoyu 仓库的原图，也不是用户生成结果的保证。

网页使用 960 × 640 JPEG，透明部分合成白底，浅色和深色界面保持图像本色。保留完整构图，仅缩小与转换格式。小菜单的缩略图按需加载，鼠标悬停或键盘聚焦选项后自动预览对应大图；窄屏将预览放到列表上方。

风格与生成说明：`references/image_styles/`；前后端共享登记表：`web/lib/image-styles.js`；本次最终提示词、PNG 原图与来源清单：`output/imagegen/image-styles/`。

替换图片时保持风格 ID 文件名，并运行 `tests/image-style-selection.test.mjs` 检查登记表、文件和后端映射。
