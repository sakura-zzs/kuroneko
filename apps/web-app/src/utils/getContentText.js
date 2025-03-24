export default function getContentText(wangEditorChildren) {
  wangEditorChildren = JSON.parse(wangEditorChildren)
  let res = ''
  wangEditorChildren.forEach((item) => {
    item.children.forEach((i) => {
      if (i.text != null) {
        // console.log(i.text)
        res += i.text
      }
    })
    res += '\n'
  })
  return res
}
