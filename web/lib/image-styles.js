// Public style recipes, not personal taste. Shared by the gallery and server whitelist.
export const imageStyles = [
  {
    "id": "sketch-notes",
    "name": "手绘知识图",
    "description": "略有起伏的墨线、手写短句、图标与柔和分区色块"
  },
  {
    "id": "minimal-line",
    "name": "极简线稿",
    "description": "少量手绘轮廓、大块留白、一个主要视觉关系"
  },
  {
    "id": "flat-vector",
    "name": "扁平矢量感插画",
    "description": "闭合几何色块、统一轮廓、以重叠而非写实光照建立层次"
  },
  {
    "id": "blueprint",
    "name": "工程蓝图",
    "description": "精密细线、工程网格、明确的模块与连接"
  },
  {
    "id": "editorial",
    "name": "杂志编辑信息图",
    "description": "出版物式字级、图解与标注配合、清楚的阅读层次"
  },
  {
    "id": "study-notes",
    "name": "手写学习笔记",
    "description": "纸面笔迹、圈画批注、荧光重点与真实书写的节奏"
  },
  {
    "id": "watercolor",
    "name": "水彩插画",
    "description": "透明叠色、晕染边缘、纸纹与可见笔触"
  },
  {
    "id": "screen-print",
    "name": "丝网版画海报",
    "description": "少量大色面、强剪影、半调网点与套印痕迹"
  },
  {
    "id": "chalkboard",
    "name": "黑板粉笔",
    "description": "深色板面、粉笔颗粒、擦拭痕迹与随讲随画的标注"
  },
  {
    "id": "ink-brush",
    "name": "水墨写意",
    "description": "提按变化的笔势、干湿浓淡、墨晕与主动留白"
  },
  {
    "id": "manga",
    "name": "叙事漫画",
    "description": "表情与动作叙事、轻重线条、气泡及分镜节奏"
  },
  {
    "id": "pixel-art",
    "name": "复古像素",
    "description": "一致像素尺度、阶梯轮廓、有限色阶与抖色"
  },
  {
    "id": "paper-cutout",
    "name": "剪纸拼贴",
    "description": "裁切或撕纸边缘、纸层叠放、纸纹与层间阴影"
  },
  {
    "id": "claymation",
    "name": "黏土微缩",
    "description": "圆润捏塑体块、接缝与指纹、柔和光照下的微缩布景"
  },
  {
    "id": "retro-pop-grid",
    "name": "复古波普",
    "description": "粗重分隔、平涂撞色、黑白反转与几何节奏"
  }
].map(item => Object.freeze({ ...item,
  path: `references/image_styles/${item.id}.md`,
  preview: `./assets/image-styles/${item.id}.jpg`,
}));

export const getImageStyle = id => imageStyles.find(item => item.id === id) || null;

