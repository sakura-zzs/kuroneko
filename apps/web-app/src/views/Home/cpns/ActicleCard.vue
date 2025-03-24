<script setup>
import { useHomeStore } from '@/stores/useHome'
import { storeToRefs } from 'pinia'
import { defineProps } from 'vue'
import Label from '@/components/label/Label.vue'
import { createEditor } from '@wangeditor/editor'

const homeStore = useHomeStore()
homeStore.getMomentList()
const { momentList, isSearch, searchList } = storeToRefs(homeStore)
const searching = (tagName) => {
  //禁止个人中心动态标签触发主页动态查询
  if (!props.isLabelClick) return
  homeStore.handleSearch(tagName)
}
const props = defineProps({
  userMomentList: {
    type: Array,
    default: () => []
  },
  isLabelClick: {
    type: Boolean,
    default: true
  }
})
const getEditorText = (html) => {
  const editor = createEditor({ html })
  return editor.getText()
}
</script>

<template>
  <div class="acticle-list">
    <ul>
      <li
        class="acticle-card"
        v-for="item in props.userMomentList.length
          ? props.userMomentList
          : isSearch
          ? searchList
          : momentList"
        :key="item.id"
      >
        <div class="acticle-card-header">
          <div class="acticle-card__userinfo">
            <div class="user-card">
              <a :href="'/user/' + item.userId" class="user-avatar">
                <img v-if="item.avatar.url" :src="item.avatar.url" />
                <img v-else src="@/assets/image/user_default.png" />
              </a>
              <a :href="'/user/' + item.userId" class="user-nickname">{{
                item.profile?.nickName ? item.profile?.nickName : '匿名用户'
              }}</a>
            </div>
          </div>
          <p class="acticle-card-time">{{ item.createTime }}</p>
        </div>
        <a :href="'/article/' + item.id" class="acticle-card-main">
          <h3 class="acticle-title">{{ item.title }}</h3>
          <div class="acticle--card__content">
            <div v-if="item.momentImg[0].url" class="acticle-preview">
              <img :src="item.momentImg[0].url" />
            </div>
            <div class="acticle-content">
              {{ getEditorText(item.html) }}
            </div>
          </div>
        </a>
        <div class="article-card-footer">
          <Label @searching="searching" :labelList="item.labelList" />
          <div class="article-card-data">
            <a :href="'/article/' + item.id + '#reply'">
              <div class="acticle-card-data-item">
                <i-ep-chat-dot-round /><span>{{ item.commentCount }}</span>
              </div>
            </a>
            <div class="acticle-card-data-item">
              <svg viewBox="0 0 1024 1024" width="1.2em" height="1.2em">
                <path
                  d="M832 364.8h-147.2s19.2-64 32-179.2c6.4-57.6-38.4-115.2-102.4-121.6h-12.8c-51.2 0-83.2 32-102.4 76.8l-38.4 96c-32 64-57.6 102.4-76.8 115.2-25.6 12.8-121.6 12.8-128 12.8H128c-38.4 0-64 25.6-64 57.6v480c0 32 25.6 57.6 64 57.6h646.4c96 0 121.6-64 134.4-153.6l51.2-307.2c6.4-70.4-6.4-134.4-128-134.4z m-576 537.6H128V422.4h128v480z m640-409.6l-51.2 307.2c-12.8 57.6-12.8 102.4-76.8 102.4H320V422.4c44.8 0 70.4-6.4 89.6-19.2 32-12.8 64-64 108.8-147.2 25.6-64 38.4-96 44.8-102.4 6.4-19.2 19.2-32 44.8-32h6.4c32 0 44.8 32 44.8 51.2-12.8 102.4-32 166.4-32 166.4l-25.6 83.2h243.2c19.2 0 32 0 44.8 12.8 12.8 12.8 6.4 38.4 6.4 57.6z"
                  p-id="4284"
                  fill="#cccccc"
                ></path>
              </svg>
              <span>1</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
@hover-color: #00c3ff;
.multi-line-ellipsis() {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.acticle-list ul .acticle-card {
  padding: 20px;
  border-bottom: 1px solid #a2a2a2;
  .acticle-card-header {
    display: flex;
    align-items: center;
    height: 24px;
    .acticle-card__userinfo {
      font-size: 12px;
      .user-card {
        display: flex;
        align-items: center;
        .user-nickname {
          .multi-line-ellipsis();
        }
        a {
          color: #666;
          margin-right: 10px;
        }
        a:hover {
          color: #4cd1e0;
        }
        a img {
          width: 24px;
        }
      }
    }
    .acticle-card-time {
      .multi-line-ellipsis();
    }
    p {
      font-size: 12px;
      color: #ccc;
    }
  }
  .acticle-card-main {
    display: flex;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    .acticle-title {
      .multi-line-ellipsis();
      height: 20px;
      margin-top: 8px;
      padding-right: 100px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .acticle--card__content {
      height: 130px;
      display: flex;
      margin-top: 10px;
      .acticle-preview {
        img {
          height: 130px;
          border-radius: 5px;
          margin-right: 10px;
        }
      }
      .acticle-content {
        height: 130px;
        //多行省略
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 8;
        color: #999;
        font-size: 14px;
      }
    }
  }
  .acticle-card-main:hover .acticle-title {
    color: @hover-color;
  }
  .article-card-footer {
    display: flex;
    justify-content: space-between;
    .article-card-data {
      display: flex;
      align-items: center;
      height: 24px;
      margin-top: 5px;
      color: #ccc;
      font-size: 14px;
      a {
        color: #ccc;
        & + .acticle-card-data-item {
          margin-left: 10px;
        }
      }
      .acticle-card-data-item {
        display: flex;
        align-items: center;
        svg {
          cursor: pointer;
        }
        span {
          margin-left: 8px;
          width: 50px;
        }
      }
    }
  }
}
</style>
