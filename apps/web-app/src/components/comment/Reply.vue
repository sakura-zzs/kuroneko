<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { localCache } from '@/utils/cache'
import kuronekoRequest, { uploadRequest } from '@/service'
import { ref, shallowRef, onBeforeUnmount } from 'vue'
import { useCommentStore } from '@/stores/useComment'
import checkLogin from '@/utils/checkLogin'
const commentStore = useCommentStore()
const token = localCache.getItem('token')
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
//使用simple模式隐藏文字选中的hoverbar
const mode = ref('simple')
//编辑器中插入过的所有图片
let insertedImageList = []
// 最终要发布的图片列表
let publishImageList = []
// 要删除的图片列表（差异）
let deleteImageList = []
//工具栏配置
const toolbarConfig = {
  //自定义工具栏菜单
  toolbarKeys: ['emotion']
}
const props = defineProps({
  isUploadImg: {
    type: Boolean,
    default: false
  },
  momentId: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: 1000
  },
  customStyle: {
    type: Object,
    default: () => {}
  },
  replyAtCommentId: {
    type: Number,
    default: 0
  }
})
//编辑器配置
const editorConfig = { MENU_CONF: [], placeholder: '请开始你的炸弹秀...' }
const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例
}
if (props.isUploadImg) {
  toolbarConfig.toolbarKeys.push({
    key: 'group-image', // 必填，要以 group 开头
    title: '', // 必填
    iconSvg:
      '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>', // 可选
    menuKeys: ['insertImage', 'uploadImage'] // 下级菜单 key ，必填
  })
  //开启评论图片上传
  editorConfig.MENU_CONF['uploadImage'] = {
    server: '/api/upload/comment',
    // form-data fieldName ，默认值 'wangeditor-uploaded-image'
    fieldName: 'commentImg',
    // 单个文件的最大体积限制，默认为 2M
    maxFileSize: 10 * 1024 * 1024, // 1M
    // 最多可上传几个文件，默认为 100
    maxNumberOfFiles: 1,
    // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
    allowedFileTypes: ['image/*'],
    // 自定义增加 http  header
    headers: {
      Accept: 'text/x-json',
      otherKey: 'xxx',
      authorization: token
    },
    // 跨域是否传递 cookie ，默认为 false
    withCredentials: true,
    // 超时时间，默认为 10 秒
    timeout: 5 * 1000, // 5 秒
    // 自定义上传
    async customUpload(file, insertFn) {
      // file 即选中的文件
      // 自己实现上传，并得到图片 url alt href
      // 最后插入图片
      const { data } = await uploadRequest.post({
        url: '/upload/comment',
        data: {
          commentImg: file
        }
      })
      console.log(data)
      //将图片id保存在alt中
      const { url, id } = data.imgLinks[0]
      //获取上传每张图片返回来的id，在这里处理没有进行发布时，什么条件下将未发布的图片进行删除
      insertFn(url, id, url)
    }
  }
}
//插入图片监听
editorConfig.MENU_CONF['insertImage'] = {
  //插入图片后进行图片记录，最后发布时，比对图片记录，将多余图片从服务器删除
  onInsertedImage(imageNode) {
    if (imageNode == null) return
    insertedImageList.push(imageNode)
  }
}
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const maxTextCount = ref(props.maxLength)
editorConfig.maxLength = maxTextCount.value

//字数达上限触发
const handleMaxLength = () => {
  ElMessage('字数已达上限！')
}
const publishing = async () => {
  //校验用户登录状态
  const loginStatus = await checkLogin()
  if (!loginStatus) return

  //评论编辑完成，点击发布按钮获取编辑器中插入的所有图片
  publishImageList = editorRef.value.getElemsByType('image')
  //将要删除的图片筛选出来
  deleteImageList = insertedImageList.filter((i) => !publishImageList.some((p) => i.alt == p.alt))
  //删除服务器中要删除的图片
  if (deleteImageList.length) {
    deleteImageList.forEach(async (item) => {
      const id = item.alt
      await kuronekoRequest.delete({ url: '/upload/comment', params: { id } })
    })
  }
  //获取编辑器json格式数据保存到数据库（将动态数据保存）
  //验证数据有效性

  const content = editorRef.value.children
  const text = editorRef.value.getText()
  if (!text.trim().length) {
    return ElMessage('评论不能为空！')
  }

  let data = null
  //如果为评论的评论(二级评论)，绑定评论id
  if (props.replyAtCommentId !== 0) {
    const res = await kuronekoRequest.post({
      url: `/comment/${props.replyAtCommentId}/reply`,
      data: { content, momentId: props.momentId }
    })
    data = res.data
  } else {
    //创建一级评论,绑定动态
    const res = await kuronekoRequest.post({
      url: '/comment',
      data: { content, momentId: props.momentId }
    })
    data = res.data
  }
  //获取评论id
  const commentId = data.insertId
  //将插入的图片与评论进行绑定
  if (publishImageList.length) {
    publishImageList.forEach(async (item) => {
      const id = item.alt
      await kuronekoRequest.patch({ url: '/upload/comment', data: { commentId }, params: { id } })
    })
  }
  //重置
  insertedImageList = []
  //清空编辑器
  editorRef.value.clear()
  ElMessage({
    showClose: true,
    message: '发布评论成功！',
    center: true,
    type: 'success'
  })
  //更新评论
  await commentStore.getCommentList(props.momentId)
}
</script>

<template>
  <div id="reply" class="reply">
    <div class="reply-body">
      <Editor
        :style="customStyle"
        class="reply-editor"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onMaxLength="handleMaxLength"
      />
    </div>
    <div class="relpy-footer">
      <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <button @click="publishing">评论</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.reply {
  width: 100%;
  .reply-body {
    .reply-editor {
      min-height: 100px;
      max-height: 300px;
      padding: 10px 10px 20px;
      border: 1px solid #ebebeb;
      border-radius: 4px;
      font-size: 14px;
      overflow-y: auto;
      background-color: #fff;
    }
    .reply-editor:focus-within {
      border-color: #00c3ff;
    }
  }
  .relpy-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    button {
      width: 86px;
      height: 34px;
      line-height: 34px;
      background-color: #00c3ff;
      color: #fff;
      border-radius: 4px;
      border: none;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
    }
  }
  :deep(.w-e-bar-divider) {
    width: 0;
  }
  :deep(.w-e-bar) {
    padding: 0;
  }
  :deep(.w-e-bar .w-e-bar-item) {
    padding: 0;
    button {
      padding: 0;
      margin-right: 20px;
    }
    .w-e-bar-item-menus-container {
      button {
        margin: 0;
        padding: 4px 12px;
      }
    }
  }
  :deep(.w-e-bar svg) {
    width: 20px;
    height: 20px;
    fill: #b3b3b3;
  }
}
</style>
