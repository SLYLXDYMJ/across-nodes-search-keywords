## across-nodes-search-keywords
> 跨节点/元素，搜索关键词

### 安装
```bash
npm i --save across-nodes-search-keywords
```

or

```html
<script src="./dist/search-test.js"></script>
```

### 使用
```js
var result = window.acrossNodesSearchKeywords({
  el: document.querySelector('body'),
  keywords: 'any text'
})

/**
 result 解析
 {
    // el 元素下的所有文本内容
    "fullText": "巴拉巴拉",
    // 搜索的关键词
    "keywords": "巴拉巴拉",
    // 匹配到的结果
    "matchResults": [
        // 代表一条匹配到的关键词数据
        {
            // 关键词出现的开始位置
            "startIndex": 266,
            // 关键词出现的结束位置
            "endIndex": 601,
            // 已经被 splitText 处理后的 nodeText 节点
            "textNodes": [
                {},
                {}
            ]
        }
    ]
}
 **/
```

### 注意
> 方法本身仅用 splitText 方法切分 nodeText 节点，并返回响应数据，除此之外不做任何其他处理 <br/>
> 需要高亮等逻辑需手动处理，如下：
```javascript
result.matchResults.forEach(function (item) {
  item.textNodes.forEach(function (node) {
    var font = document.createElement('font')
    font.innerHTML = node.textContent
    node.parentNode.replaceChild(font, node)
  })
})
```