# GitHub个人资料页面设置指南

这个仓库包含了一个定制的GitHub个人资料页面，使用紫色主题和AI元素设计，让您的个人资料更加引人注目。

## 使用步骤

### 1. 创建特殊仓库

在GitHub上创建一个与您的用户名相同的仓库。例如，如果您的GitHub用户名是"username"，那么仓库名应该是"username"。

这个特殊的仓库将被GitHub识别为您的个人资料页面，README.md文件的内容将显示在您的个人资料页面上。

### 2. 复制文件

将本仓库中的以下文件复制到您新创建的仓库中：

- `README.md`：主要的个人资料内容
- `.github/workflows/snake.yml`：用于生成贡献图蛇形动画的GitHub Actions工作流配置

### 3. 配置个人信息

编辑`README.md`文件，替换个人信息：

- 将所有的`hotianbexuanto`替换为您的GitHub用户名
- 更新个人简介、技术栈和联系方式
- 根据需要调整徽章和链接

### 4. 设置GitHub Actions

要使贡献图蛇形动画正常工作，您需要在仓库的"Settings"（设置）>"Actions"（操作）>"General"（常规）中：

1. 确保"Actions permissions"（操作权限）选择了"Allow all actions and reusable workflows"（允许所有操作和可重用工作流）
2. 在"Workflow permissions"（工作流权限）部分，选择"Read and write permissions"（读取和写入权限）并勾选"Allow GitHub Actions to create and approve pull requests"（允许GitHub Actions创建和批准拉取请求）

### 5. 自定义样式

您可以根据个人喜好进一步自定义样式：

#### 更改颜色主题

在README.md文件中，将颜色代码`B186D6`替换为您喜欢的颜色代码。

#### 修改徽章样式

更改徽章的`style`参数，可选值包括：
- `flat`
- `flat-square`
- `for-the-badge`
- `plastic`
- `social`

例如：`https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white`

#### 添加更多图标和徽章

访问[shields.io](https://shields.io/)或[simpleicons.org](https://simpleicons.org/)获取更多图标和徽章。

## 高级自定义

### 自定义统计卡片

GitHub统计卡片可以通过修改URL参数来自定义：

```
https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true&theme=radical
```

参数包括：
- `username`：您的GitHub用户名
- `show_icons`：是否显示图标（true/false）
- `theme`：主题颜色（如radical, tokyonight, onedark等）
- `bg_color`：背景颜色
- `title_color`：标题颜色
- `text_color`：文本颜色
- `icon_color`：图标颜色

### 添加自定义图片

如果要添加自定义图片，可以将图片上传到`assets/images`目录，然后在README.md中引用：

```markdown
<div align="center">
  <img src="./assets/images/your-image.png" width="600" alt="描述" />
</div>
```

## 疑难解答

### 贡献图蛇形动画不显示

如果贡献图蛇形动画不显示，请检查：

1. 确保`.github/workflows/snake.yml`文件正确配置
2. 确保GitHub Actions有适当的权限
3. 检查仓库的"Actions"选项卡，查看工作流是否成功运行
4. 工作流运行后，应该会在`output`分支中生成SVG文件

### 统计卡片不显示

如果GitHub统计卡片不显示，可能是由于GitHub API的限制。尝试：

1. 确保URL中的用户名拼写正确
2. 使用缓存参数：`&cache_seconds=86400`
3. 如果仍然有问题，考虑部署自己的Vercel实例

## 资源链接

- [Shields.io](https://shields.io/)：创建徽章
- [Simple Icons](https://simpleicons.org/)：提供图标
- [GitHub README统计信息](https://github.com/anuraghazra/github-readme-stats)：生成统计卡片
- [GitHub贡献蛇形动画](https://github.com/Platane/snk)：生成贡献图蛇形动画
- [Capsule Render](https://github.com/kyechan99/capsule-render)：创建漂亮的页面头部和底部

---

希望您喜欢这个GitHub个人资料页面！如果有任何问题或建议，欢迎创建issue或提交pull request。 