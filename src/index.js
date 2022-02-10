export default function ({
  /**
   *  @param { HTMLElement } [el=document.body] - 指定搜索元素
   **/
  el = document.body,
  
  /**
   *  @param { String } keywords - 搜索关键词
   **/
  keywords
}) {
  let textNodes = getTextNodeList(el)
  let textInfoList = getTextInfoList(textNodes)
  let fullText = textInfoList.map(({ text }) => text).join('')
  let matchList = getMatchList(fullText, keywords)
  let matchTextNodes = getMatchTextNodes(textNodes, textInfoList, matchList)
  
  let matchResults = (function () {
    var results = []
    matchList.forEach(function (item, i) {
      results.push({
        startIndex: matchList[ i ].index,
        endIndex: matchList[ i ].index + matchList[ i ][ 0 ].length - 1,
        textNodes: matchTextNodes[ i ]
      })
    })
    return results
  })()
  
  return {
    fullText,
    keywords,
    matchResults
  }
}

function getTextNodeList (dom) {
  const nodeList = [ ...dom.childNodes ]
  const textNodes = []
  while (nodeList.length) {
    const node = nodeList.shift()
    if (node.nodeType === node.TEXT_NODE) {
      textNodes.push(node)
    }
    else {
      nodeList.unshift(...node.childNodes)
    }
  }
  return textNodes
}
function getTextInfoList (textNodes) {
  let length = 0
  const textList = textNodes.map(node => {
    let startIdx = length, endIdx = length + node.wholeText.length
    length = endIdx
    return {
      text: node.wholeText,
      startIdx,
      endIdx
    }
  })
  return textList
}
function getMatchList (content, keywords) {
  const characters = [ ...'\\[]()?.+*^${}:' ].reduce((r, c) => (r[ c ] = true, r), {})
  keywords = keywords.split('').map(s => characters[ s ] ? `\\${ s }` : s).join('[\\s\\n]*')
  const reg = new RegExp(keywords, 'gmi')
  
  // matchAll结果是个迭代器，用扩展符展开得到数组
  return [ ...content.matchAll(reg) ]
}
function getMatchTextNodes (textNodes, textList, matchList) {
  let results = []
  
  // 对于每一个匹配结果，可能分散在多个标签中，找出这些标签，截取匹配片段并用font标签替换出
  for (let i = matchList.length - 1; i >= 0; i--) {
    const match = matchList[ i ]
    const matchStart = match.index, matchEnd = matchStart + match[ 0 ].length // 匹配结果在拼接字符串中的起止索引
    
    results[ i ] = []
    
    // 遍历文本信息列表，查找匹配的文本节点
    for (let textIdx = 0; textIdx < textList.length; textIdx++) {
      const { text, startIdx, endIdx } = textList[ textIdx ] // 文本内容、文本在拼接串中开始、结束索引
      if (endIdx < matchStart) continue // 匹配的文本节点还在后面
      if (startIdx >= matchEnd) break // 匹配文本节点已经处理完了
      let textNode = textNodes[ textIdx ] // 这个节点中的部分或全部内容匹配到了关键词，将匹配部分截取出来进行替换
      const nodeMatchStartIdx = Math.max(0, matchStart - startIdx) // 匹配内容在文本节点内容中的开始索引
      const nodeMatchLength = Math.min(endIdx, matchEnd) - startIdx - nodeMatchStartIdx // 文本节点内容匹配关键词的长度
      if (nodeMatchStartIdx > 0) textNode = textNode.splitText(nodeMatchStartIdx) // textNode取后半部分
      if (nodeMatchLength < textNode.wholeText.length) textNode.splitText(nodeMatchLength)
      
      // const font = document.createElement('font')
      // font.innerText = text.substr(nodeMatchStartIdx, nodeMatchLength)
      // textNode.parentNode.replaceChild(font, textNode)
      
      results[ i ].push(textNode)
      // console.log(textNode)
    }
  }
  
  return results
}