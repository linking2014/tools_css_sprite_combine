# tools_css_sprite_combine

将多张序列帧图片横向拼接为 CSS 精灵图（Sprite Sheet），并生成对应的帧动画组件代码。内置 **Vue 3** 与 **微信小程序（MPX）** 两套动画组件，可在浏览器中实时预览动画效果。

## 功能特性

- **精灵图拼接**：拖拽或选择多张图片，按文件名自然排序（A→Z，支持数字排序），横向拼接为一张 PNG
- **实时预览**：拼接完成后自动在页面内预览 CSS `steps()` 帧动画
- **代码生成**：一键复制 Vue / MPX 组件调用代码
- **两种导出方式**：
  - **Canvas 导出**：常规方式，适合常规尺寸
  - **无画布流式导出**：逐行读取像素并流式压缩 PNG，避免超大画布内存限制（需浏览器支持 `CompressionStream`）

## 项目结构

```
tools_css_sprite_combine/
├── index.html                # 主工具（单文件，零构建，GitHub Pages 默认入口）
├── css_sprite_combine.html   # 兼容旧链接，自动跳转到首页
└── v-anim-frame-2/
    ├── v-anim-frame.vue      # Vue 3 帧动画组件
    ├── v-anim-frame-3.mpx    # MPX 小程序组件（推荐）
    ├── v-anim-frame-2.mpx    # MPX 旧版组件
    ├── v-anim-frame-2.js     # 旧版组件逻辑
    ├── v-anim-frame-3 修复版.mpx
    ├── vmin.wxs              # 小程序单位换算辅助
    └── readme.md             # 组件简要说明
```

## 快速开始

### 1. 启动本地服务

工具页面会通过 `fetch` 加载 Vue 单文件组件，**不能直接双击打开 HTML 文件**，需通过 HTTP 服务访问：

```bash
# 任选其一
npx serve .
python3 -m http.server 8080
```

浏览器访问 `http://localhost:8080/`（或 `http://localhost:8080/index.html`，端口以实际为准）。

### 2. 制作精灵图

1. 准备序列帧图片，**所有帧宽高必须一致**
2. 建议文件名带序号，如 `frame_01.png`、`frame_02.png`（工具按文件名自动排序）
3. 拖拽或点击上传图片
4. 预览无误后点击 **下载 PNG**，得到横向排列的精灵图

### 3. 部署图片

将导出的 `sprite.png` 上传到 CDN 或云存储（如微信云开发），获取 **HTTPS 外链地址**。小程序中不能使用 Blob URL。

### 4. 接入动画组件

在工具页面的「帧动画预览」区域调整参数，点击 **复制 Vue 代码** 或 **复制 MPX 代码**，粘贴到项目中并填入真实的 `url`。

## 工具页面说明

| 区域 | 说明 |
|------|------|
| 上传图片 | 支持拖拽 / 点击选择，仅接受 `image/*` |
| 已选择文件 | 按文件名排序后的列表 |
| 预览与导出 | Canvas 预览、下载 PNG、流式导出、清空 |
| 帧动画预览 | Vue 3 实时预览 + 参数配置 + 代码复制 |

**约束：**

- 所有图片尺寸必须相同，否则拒绝拼接
- 帧之间无间距，从左到右横向排列（与 CSS Sprite 标准用法一致）
- 流式导出需 Chrome 80+、Edge 80+ 等支持 `CompressionStream` 的浏览器

## 动画组件 API

基于 CSS `background-position` + `animation-timing-function: steps()` 实现逐帧播放，无需 JavaScript 逐帧切换。

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `String` | `''` | 精灵图外链地址（必填） |
| `width` | `Number` / `String` | `0` | 单帧宽度 |
| `height` | `Number` / `String` | `0` | 单帧高度 |
| `count` | `Number` / `String` | `0` | 总帧数 |
| `duration` | `Number` / `String` | `0` | 每帧播放时长（秒） |
| `loop` | `String` / `Number` | `'infinite'` | 循环次数，`infinite` 或具体数字 |
| `reverse` | `Boolean` | `false` | 是否倒序播放 |
| `pause` | `Boolean` | `false` | 是否暂停动画 |
| `unit` | `String` | Vue: `'px'` / MPX: `'rpx'` | 尺寸单位：`px`、`vmin`、`rpx`（MPX）、`vw`（Vue 预览） |
| `pointerEvents` | `String` | `'auto'` | CSS `pointer-events` |

### Events

| 事件 | 说明 | 回调参数 |
|------|------|----------|
| `animend` | 动画播放结束 | `{ data: number }` |
| `animiteration` | 每完成一轮循环 | `{ data: number }` 当前轮次 |

> MPX 组件事件绑定写法：`bind:animend`、`bind:animiteration`

## Vue 3 接入

将 `v-anim-frame-2/v-anim-frame.vue` 复制到项目中，注册为组件后使用：

```vue
<template>
  <anim-frame
    url="https://example.com/sprite.png"
    :width="100"
    :height="100"
    :count="10"
    :duration="0.1"
    loop="infinite"
    :reverse="false"
    :pause="false"
    unit="px"
    pointerEvents="auto"
    @animend="onAnimEnd"
    @animiteration="onAnimIteration"
  />
</template>

<script setup>
import AnimFrame from '@/components/v-anim-frame.vue'

function onAnimEnd(e) {
  console.log('动画结束', e)
}

function onAnimIteration(e) {
  console.log('完成一轮', e.data)
}
</script>
```

## 微信小程序（MPX）接入

推荐使用 `v-anim-frame-3.mpx`（较 v2 修复了倒序播放、动画重启等问题）。

1. 将 `v-anim-frame-3.mpx` 和 `vmin.wxs` 复制到小程序组件目录
2. 在页面 JSON 中注册：

```json
{
  "usingComponents": {
    "v-anim-frame-3": "/components/v-anim-frame-3/v-anim-frame-3"
  }
}
```

3. 在模板中使用：

```html
<v-anim-frame-3
  url="https://example.com/sprite.png"
  width="100"
  height="100"
  count="10"
  duration="0.1"
  loop="infinite"
  reverse="{{false}}"
  pause="{{false}}"
  unit="rpx"
  pointerEvents="auto"
  bind:animiteration="onAnimIteration"
  bind:animend="onAnimEnd"
/>
```

**小程序注意事项：**

- `url` 必须是网络 HTTPS 地址，不支持本地路径或 Blob URL
- 建议使用 `rpx` 单位，减少不同机型上的抖动
- 精灵图帧间距为 0，从左到右排列

## 原理简述

```
┌──────┬──────┬──────┬──────┐
│帧 1  │帧 2  │帧 3  │帧 4  │  ← 横向拼接的精灵图
└──────┴──────┴──────┴──────┘

组件只显示 width × height 的视口，
通过 background-position-x 从 0 移动到 -(width × (count-1))，
配合 steps(count-1) 实现逐帧切换。
```

## 浏览器兼容性

| 功能 | 要求 |
|------|------|
| 基础上传 / Canvas 预览 / 下载 | 现代浏览器均可 |
| Vue 3 预览 | 需网络加载 CDN（Vue、vue3-sfc-loader） |
| 无画布流式导出 | 需 `CompressionStream`（Chrome 80+、Edge 80+、Safari 16.4+） |

## 常见问题

**Q: 直接打开 HTML 文件，预览区域报错？**  
A: 请通过本地 HTTP 服务访问，否则 `fetch` 加载 `.vue` 文件会被浏览器 CORS 策略拦截。

**Q: 图片尺寸不一致怎么办？**  
A: 请先用图像工具统一裁剪/缩放，工具会校验并拒绝不同尺寸的混合上传。

**Q: 动画播放过快或过慢？**  
A: 调整 `duration`（单帧时长，单位秒）。总时长 ≈ `duration × count`。

**Q: 小程序里动画有轻微抖动？**  
A: 优先使用 `unit="rpx"`，并确保精灵图单帧尺寸为整数像素。

## License

MIT
