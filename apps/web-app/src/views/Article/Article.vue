<script setup>
import { useRoute } from 'vue-router'
import { useHomeStore } from '@/stores/useHome'

import { ref, onMounted } from 'vue'
import { createEditor } from '@wangeditor/editor'

import Reply from '@/components/comment/Reply.vue'
import ReplyList from '@/components/comment/ReplyList.vue'
import Label from '@/components/label/Label.vue'

const route = useRoute()
const homeStore = useHomeStore()
//动态详情展示
const { id } = route.params
const editorRef = ref()
const momentData = ref()
const userId = ref()
onMounted(async () => {
  await homeStore.getMomentList()
  momentData.value = homeStore.getMomentById(id)
  userId.value = momentData.value.userId
  const editor = createEditor({ html: momentData.value.html })
  editorRef.value.innerHTML = editor.getHtml()
})
</script>

<template>
  <div class="main-content">
    <el-container>
      <el-main>
        <div class="article-container">
          <div class="article-header">
            <div class="article-title">
              <h1>{{ momentData?.title }}</h1>
            </div>
            <div class="article-info">
              <div class="article-info-item-count"><i-ep-view /><span>1</span></div>
              <div class="article-info-item-count"><i-ep-chat-dot-round /><span>1</span></div>
              <div class="article-info-item-count">
                <svg viewBox="0 0 1024 1024" width="1.2em" height="1.2em">
                  <path
                    d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z"
                    p-id="4284"
                    fill="#cccccc"
                  ></path>
                </svg>
                <span>1</span>
              </div>
              <div class="article-info-item-count"><i-ep-star /><span>1</span></div>
            </div>
            <div class="article-update-time">
              <span>文章发表: {{ momentData?.createTime }}</span>
              <span>最后编辑: {{ momentData?.updateTime }}</span>
            </div>
          </div>
          <el-card>
            <div class="wang-editor" ref="editorRef"></div>
          </el-card>
          <div class="article-footer">
            <div class="article-tags">
              <Label :labelList="momentData?.labelList" />
            </div>
            <div class="article-footer-info">
              <div class="article-info-item-count">
                <svg viewBox="0 0 1024 1024" width="1.2em" height="1.2em">
                  <path
                    d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z"
                    p-id="4284"
                    fill="#999999"
                  ></path>
                </svg>
                <span>1</span>
              </div>
              <div class="article-info-item-count"><i-ep-star /><span>1</span></div>
            </div>
          </div>
        </div>
        <div class="article-reply">
          <reply :momentId="id" :is-upload-img="false" />
        </div>
        <div class="article-reply-list">
          <reply-list :autherId="userId" :momentId="id" />
        </div>
      </el-main>
      <el-aside>
        <div class="article-author">
          <a :href="'/user/' + userId">
            <img v-if="momentData?.avatar?.url" :src="momentData?.avatar?.url" alt="" />
            <img v-else src="../../assets/image/user_default.png" alt="" />
          </a>
          <div class="article-author-info">
            <a :href="'/user/' + userId"
              ><span>{{ momentData?.profile?.nickName }}</span></a
            >
            <p>{{ momentData?.profile?.selfProfile }}</p>
          </div>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<style lang="less" scoped>
@hover-color: #00c3ff;
:deep(.el-main) {
  padding: 0;
}
.article-author {
  padding: 0 20px 0 30px;
  height: 160px;
  background-color: #fff;
  display: flex;
  margin-bottom: 20px;
  border-radius: 4px;
  align-items: center;
  img {
    width: 80px;
    vertical-align: top;
  }
  .article-author-info {
    margin-left: 15px;
    display: flex;
    flex-direction: column;
    a {
      color: #666;
      span {
        line-height: 22px;
        font-weight: 600;
        font-size: 16px;
        margin-right: 6px;
        white-space: normal;
      }
    }
    a:hover {
      color: @hover-color;
    }
    p {
      font-size: 14px;
      line-height: 14px;
      color: #999;
      margin-top: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.article-info-item-count {
  display: flex;
  margin-left: 30px;
  text-align: center;
  color: #ccc;
}
.main-content {
  width: 1200px;
  padding: 30px 100px 0;
  color: #333;
  border: none;
  .el-main {
    .article-container {
      padding: 40px 50px;
      background-color: #fff;
      :deep(img) {
        width: 100%;
      }
      .article-header {
        .article-title h1 {
          font-size: 22px;
          line-height: 26px;
          margin: 0;
        }
        .article-info {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40px;
          padding: 0 15px;
          background-color: #f7f8fc;
          margin-top: 15px;
          border-radius: 5px;
        }
        .article-update-time {
          text-align: center;
          color: #ccc;
          margin-top: 20px;
          font-size: 14px;
          span {
            padding: 0 6px;
            line-height: 18px;
          }
          span + span {
            border-left: 1px solid #ccc;
          }
        }
      }
      .el-card {
        width: 100%;
        margin-top: 24px;
        border: none;
        box-shadow: none;
      }
      .article-footer {
        margin-top: 30px;
        .article-footer-info {
          display: flex;
          justify-content: center;
          margin-top: 30px;
          padding-top: 40px;
          border-top: 1px solid #f0f0f0;
          .article-info-item-count {
            display: flex;
            align-items: center;
            font-size: 28px;
            color: #999;
            span {
              margin-left: 20px;
              font-size: 14px;
            }
          }
          .article-info-item-count + .article-info-item-count {
            margin-left: 100px;
          }
        }
      }
    }
    .article-reply {
      margin-top: 20px;
      background-color: #fff;
      padding: 30px 50px;
      border-radius: 4px;
    }
    .article-reply-list {
      margin-top: 20px;
      border-radius: 4px;
      background-color: #fff;
    }
  }
  .el-aside {
    margin-left: 20px;
  }
}
:deep(.el-card__body) {
  padding: 0;
}
</style>
