<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { localCache } from '@/utils/cache'
import { uploadRequest } from '@/service'
import kuronekoRequest from '@/service/index'
import { useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/useArticle'
import checkLogin from '@/utils/checkLogin'
const router = useRouter()
const token = localCache.getItem('token')
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
//工具栏模式
const mode = ref('default')
//编辑器中插入过的所有图片
let insertedImageList = []
//最终要发布的图片列表
let publishImageList = []
//要删除的图片列表（差异）
let deleteImageList = []
// 内容 HTML
const valueHtml = ref()
//title
const acticleTitle = ref()
//获取标签列表
let labelNameList = []
const acticleStore = useArticleStore()
onMounted(async () => {
  await acticleStore.getLabelList()
  labelNameList = acticleStore.getLabelNameList
})
/**
 * 菜单key获取方法
 * f12检查对应菜单，data-menu-key属性即为该菜单项的key
 */
//工具栏配置
const toolbarConfig = {
  excludeKeys: [
    'group-video', // 排除视频上传菜单
    'fullScreen' //排除全屏编辑
  ]
}
const editorConfig = { MENU_CONF: [], placeholder: '请输入内容...' }
//图片上传
editorConfig.MENU_CONF['uploadImage'] = {
  server: '/api/upload/moment',
  // form-data fieldName ，默认值 'wangeditor-uploaded-image'
  fieldName: 'momentImg',

  // 单个文件的最大体积限制，默认为 2M
  maxFileSize: 10 * 1024 * 1024, // 1M

  // 最多可上传几个文件，默认为 100
  maxNumberOfFiles: 9,

  // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
  allowedFileTypes: ['image/*'],

  // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
  // meta: {
  //     token: 'xxx',
  //     otherKey: 'yyy'
  // },

  // 将 meta 拼接到 url 参数中，默认 false
  metaWithUrl: false,

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
  // 上传之前触发
  // onBeforeUpload(file) {
  //   // file 选中的文件，格式如 { key: file }
  //   return file

  //   // 可以 return
  //   // 1. return file 或者 new 一个 file ，接下来将上传
  //   // 2. return false ，不上传这个 file
  // },

  // // 上传进度的回调函数
  // onProgress(progress) {
  //   // progress 是 0-100 的数字
  //   console.log('progress', progress)
  // },

  // // 单个文件上传成功之后
  // onSuccess(file, res) {
  //   console.log(`${file.name} 上传成功`, res)
  // },

  // // 单个文件上传失败
  // onFailed(file, res) {
  //   console.log(`${file.name} 上传失败`, res)
  // },

  // // 上传错误，或者触发 timeout 超时
  // onError(file, err, res) {
  //   console.log(`${file.name} 上传出错`, err, res)
  // },
  // 自定义上传
  async customUpload(file, insertFn) {
    // file 即选中的文件
    // 自己实现上传，并得到图片 url alt href
    // 最后插入图片
    // console.log(file)
    const { data } = await uploadRequest.post({
      url: '/upload/moment',
      data: {
        momentImg: file
      }
    })
    //将图片id保存在alt中
    const { url, id } = data.imgLinks[0]
    insertFn(url, id, url)
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

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const maxTextCount = ref(10000)
editorConfig.maxLength = maxTextCount.value

//字数达上限触发
const handleMaxLength = () => {
  ElMessage('字数已达上限！')
}

const publishing = async () => {
  const loginStatus = await checkLogin()
  if (!loginStatus) return
  //编辑完成，点击发布按钮获取编辑器中插入的所有图片
  publishImageList = editorRef.value.getElemsByType('image')
  //将要删除的图片筛选出来
  deleteImageList = insertedImageList.filter((i) => !publishImageList.some((p) => i.alt == p.alt))
  //删除服务器中要删除的图片
  if (deleteImageList.length) {
    deleteImageList.forEach(async (item) => {
      const id = item.alt
      await kuronekoRequest.delete({ url: '/upload/moment', params: { id } })
    })
  }
  //获取编辑器json格式数据保存到数据库（将动态数据保存）
  //验证数据有效性

  //不再保存json格式
  // const content = editorRef.value.children
  const text = editorRef.value.getText()
  const html = editorRef.value.getHtml()
  if (!acticleTitle.value?.trim().length) {
    return ElMessage('请填写标题！')
  }
  if (text.trim().length < 20) {
    return ElMessage('内容字数不能少于20！')
  }
  if (!selectTagRef.value?.length) {
    return ElMessage('请至少选择一个标签！')
  }
  //创建动态
  const { data } = await kuronekoRequest.post({
    url: '/moment',
    data: { title: acticleTitle.value, html }
  })
  //获取动态id
  const momentId = data.insertId
  //将插入的图片与动态进行绑定
  if (publishImageList.length) {
    publishImageList.forEach(async (item) => {
      const id = item.alt
      await kuronekoRequest.patch({ url: '/upload/moment', data: { momentId }, params: { id } })
    })
  }
  //将动态与tag绑定
  selectTagRef.value.forEach(async (labelName) => {
    await kuronekoRequest.post({ url: `/moment/${momentId}/label`, data: { labelName } })
  })
  //重置
  insertedImageList = []
  ElMessage({
    showClose: true,
    message: '发布成功！',
    center: true,
    type: 'success'
  })
  router.push('/home')
}
//远程搜索选择tag
const selectTagRef = ref()
//控制是否显示加载
const loading = ref(false)
const options = ref([])
const remoteMethod = (query) => {
  if (selectTagRef.value.length == 6) {
    ElMessage('最多只能添加6个标签！')
  }
  query = query.trim()
  if (query) {
    options.value = labelNameList.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
  } else {
    options.value = []
  }
}
</script>

<template>
  <div class="publish-container">
    <div class="publish-header">
      <h1>发布帖子</h1>
    </div>
    <div class="publish-main">
      <div class="article-title">
        <div class="title-label label"><span>标题:</span></div>
        <el-input
          v-model="acticleTitle"
          maxlength="30"
          placeholder="标题(必填)"
          show-word-limit
          type="text"
        />
      </div>
      <div class="editor-container">
        <div class="editor-label label"><span>内容:</span></div>
        <el-card>
          <div class="wang-editor">
            <Toolbar
              style="border-bottom: 1px solid #ebebeb"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              v-model="valueHtml"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
              @onMaxLength="handleMaxLength"
            />
          </div>
        </el-card>
      </div>
      <div class="tags">
        <div class="label"><span>选择标签:</span></div>
        <el-select
          v-model="selectTagRef"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="搜索标签:选择文章标签以获得更高浏览量！"
          :remote-method="remoteMethod"
          :loading="loading"
        >
          <el-option v-for="item in options" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="publish-footer">
      <el-button type="primary" @click="publishing">发布</el-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.publish-container {
  width: 1000px;
  margin: 30px 0 62px;
  padding-bottom: 70px;
  background-color: #fff;
  :deep(.el-card__body) {
    padding: 0;
  }
  .publish-header {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #f0f0f0;
    padding: 0 30px;
    h1 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }
  .publish-main {
    padding: 50px 80px 40px;
  }
  .article-title {
    display: flex;
    .el-input {
      width: 740px;
    }
  }
  .editor-container {
    display: flex;
    margin-top: 40px;
    .el-card.is-always-shadow {
      box-shadow: none;
    }
    .el-card {
      border: 1px solid #ebebeb;
    }
  }
  .tags {
    display: flex;
    margin-top: 40px;
    align-items: center;
    .el-select {
      width: 500px;
    }
  }
  .publish-footer {
    display: flex;
    justify-content: center;
    .el-button {
      width: 190px;
      height: 42px;
      background-color: #00c3ff;
    }
  }
  .wang-editor {
    position: relative;
    width: 740px;
    min-height: 380px;
  }
}
.label {
  width: 100px;
  font-size: 14px;
  line-height: 50px;
}
</style>
