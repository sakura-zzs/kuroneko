<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useCommentStore } from '@/stores/useComment'
import { useUserStore } from '@/stores/useUser'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash'
import Reply from './Reply.vue'
import kuronekoRequest from '@/service'
const { userProfile, loginStatus } = storeToRefs(useUserStore())
const replyListIndex = ref(1)
const isShowAllCmt = ref(true)
const toggleReplyList = (index) => {
  if (index === 1) {
    isShowAllCmt.value = true
  } else {
    //筛选出楼主评论
    isShowAllCmt.value = false
  }
  if (index == replyListIndex.value) {
    return
  }
  replyListIndex.value = index
}
const props = defineProps({
  momentId: {
    type: String,
    default: ''
  },
  autherId: {
    type: Number
  }
})
//获取评论数据
const commentStore = useCommentStore()
const replyTextList = computed(() => commentStore.commentText)
let start = 0,
  end = 10
const loadList = ref([])
//更新loadList
watch(replyTextList, (newValue) => {
  loadList.value = [...newValue.slice(start, end)]
})
//下拉加载更多
const loadMore = () => {
  if (end < replyTextList.value?.length) {
    // start += 10
    end += 10
    //追加
    const loadData = replyTextList.value.slice(start, end)
    loadList.value = [...loadData]
  }
}

//页面滚动事件处理函数
const handleScroll = () => {
  //获取页面卷起的高度
  const scrollY = window.scrollY
  //获取窗口高度
  const windowHeight = window.innerHeight
  //获取文档总高
  const documentHeight = document.body.scrollHeight
  //文档总高减去页面卷起高度和窗口高度就能获取到页面剩余高度
  if (scrollY + windowHeight >= documentHeight - 100) {
    loadMore()
  }
}

onMounted(async () => {
  await commentStore.getCommentList(props.momentId)
  await commentStore.getCommentReplyList()
  //使用防抖函数对频繁触发进行优化
  window.addEventListener('scroll', debounce(handleScroll, 1000))
})
//筛选出作者评论
const autherComment = computed(() => commentStore.getAutherCmt(props.autherId))

//回复
const handleReply = (id, lv1Replyindex, lv2ReplyIndex, replyLv) => {
  if (!replyLv) {
    //同时只显示一个回复控件,回复一级评论
    replyTextList.value.forEach((v, i) => {
      //关闭二级评论的回复窗口
      v.commentReplyList.forEach((item) => {
        item.isShowReply = false
      })

      v.isShowReply = i === lv1Replyindex ? !v.isShowReply : false
    })
  } else {
    //回复二级评论
    replyTextList.value.forEach((v) => {
      //关闭一级评论的回复窗口
      v.isShowReply = false
      v.commentReplyList.forEach((item, index) => {
        item.isShowReply = index === lv2ReplyIndex ? !item.isShowReply : false
      })
    })
  }
}
const style = ref({ width: '100%', maxHeight: '192px', minHeight: '64px' })

const showDeleteBtn = (status, lv1Replyindex, lv2ReplyIndex, replyLv) => {
  //status 如果当前登录了且登录用户为动态作者或者为评论用户
  if (!status) return
  if (!replyLv) {
    //同时只显示一个删除按钮,一级评论删除按钮
    replyTextList.value.forEach((v, i) => {
      if (i === lv1Replyindex) {
        v.isShowDelete = true
        return
      }
    })
  } else {
    //二级评论删除按钮
    replyTextList.value.forEach((v) => {
      v.commentReplyList.forEach((item, index) => {
        if (index === lv2ReplyIndex) {
          item.isShowDelete = true
          return
        }
      })
    })
  }
}
const hideDeleteBtn = (status, lv1Replyindex, lv2ReplyIndex, replyLv) => {
  if (!status) return
  if (!replyLv) {
    //同时只显示一个删除按钮,一级评论删除按钮
    replyTextList.value.forEach((v, i) => {
      if (i === lv1Replyindex) {
        v.isShowDelete = false
        return
      }
    })
  } else {
    //二级评论删除按钮
    replyTextList.value.forEach((v) => {
      v.commentReplyList.forEach((item, index) => {
        if (index === lv2ReplyIndex) {
          item.isShowDelete = false
          return
        }
      })
    })
  }
}
const handleDeleteClick = async (status, commentId) => {
  if (status) {
    const { data } = await kuronekoRequest.delete({ url: `/comment/${commentId}` })
    if (data.affectedRows) {
      ElMessage({
        showClose: true,
        message: '删除成功！',
        center: true,
        type: 'success'
      })
      //获取最新数据
      await commentStore.getCommentList(props.momentId)
    }
  }
}
</script>

<template>
  <div class="reply-list">
    <div class="reply-list-head">
      <div class="reply-filter">
        <span :class="{ active: replyListIndex == 1 }" @click="toggleReplyList(1)">全部评论</span>
        <span :class="{ active: replyListIndex == 2 }" @click="toggleReplyList(2)">只看楼主</span>
      </div>
    </div>
    <p class="reply-list-empty" v-if="!replyTextList?.length">暂时还没有评论哦~</p>
    <template v-for="(item, index) in isShowAllCmt ? loadList : autherComment" :key="item.id">
      <div class="reply-list-body">
        <div class="reply-detail">
          <div class="reply-detail-left">
            <!-- 跳转至用户空间 -->
            <a href="javascript:;">
              <div class="user-avatar">
                <img v-if="item?.userInfo?.avatar" :src="item?.userInfo?.avatar" />
                <img v-else src="@/assets/image/user_default.png" />
              </div>
            </a>
          </div>
          <div class="reply-detail-container">
            <div class="reply-detail-header">
              <div class="reply-detail-account">{{ item.userInfo.nickName }}</div>
              <div
                class="reply-detail-operation-top"
                @mouseenter="
                  showDeleteBtn(
                    (loginStatus && props.autherId === userProfile.userId) ||
                      item.userId === userProfile.userId,
                    index,
                    null,
                    false
                  )
                "
                @mouseleave="
                  hideDeleteBtn(
                    (loginStatus && props.autherId === userProfile.userId) ||
                      item.userId === userProfile.userId,
                    index,
                    null,
                    false
                  )
                "
              >
                <span
                  @click="
                    handleDeleteClick(
                      (loginStatus && props.autherId === userProfile.userId) ||
                        item.userId === userProfile.userId,
                      item.id
                    )
                  "
                  v-show="item.isShowDelete"
                  >删除</span
                >
              </div>
            </div>
            <div class="reply-detail-content">
              <p v-for="c in item.content" :key="c">{{ c }}</p>
            </div>
            <div class="reply-detail-bottom">
              <div class="reply-detail-operation-bottom">
                <div class="reply-detail-time">{{ item.createTime }}</div>
                <div class="reply-detail-operation-bottom-right">
                  <div
                    @click="handleReply(item.id, index, null, false)"
                    class="reply-detail-bottom-reply-btn"
                  >
                    回复
                  </div>
                  <div class="heart-click">
                    点赞
                    <span>0</span>
                  </div>
                  <div class="down-click">点踩</div>
                </div>
              </div>
            </div>
            <div
              class="reply-detail-replies"
              v-if="item.isShowReply || item.commentReplyList?.length"
            >
              <reply
                :momentId="item.momentId"
                :replyAtCommentId="item.id"
                v-if="item.isShowReply"
                :maxLength="500"
              />
              <template
                v-for="(commentReply, lv2ReplyIndex) in item.commentReplyList"
                :key="commentReply.id"
              >
                <div class="reply-detail-comment-reply">
                  <div class="reply-detail-comment-reply-header">
                    <div class="reply-detail-comment-reply-account">
                      <a href="javascript:;">
                        <img
                          v-if="commentReply?.userInfo?.avatar"
                          :src="commentReply?.userInfo?.avatar"
                        />
                        <img v-else src="@/assets/image/user_default.png" />
                        <span>{{ commentReply.userInfo.nickName }}</span>
                        <div
                          v-if="
                            commentReply.replyAtUser.nickName && commentReply.commentId !== item.id
                          "
                        >
                          <span class="reply-detail-comment-reply-account-at">回复</span>
                          <span>{{ commentReply.replyAtUser.nickName }}</span>
                        </div>
                      </a>
                    </div>
                    <div
                      @mouseenter="
                        showDeleteBtn(
                          (loginStatus && props.autherId === userProfile.userId) ||
                            commentReply.userId === userProfile.userId,
                          null,
                          lv2ReplyIndex,
                          true
                        )
                      "
                      @mouseleave="
                        hideDeleteBtn(
                          (loginStatus && props.autherId === userProfile.userId) ||
                            commentReply.userId === userProfile.userId,
                          null,
                          lv2ReplyIndex,
                          true
                        )
                      "
                      class="reply-detail-comment-reply-operation-top"
                    >
                      <span
                        @click="
                          handleDeleteClick(
                            (loginStatus && props.autherId === userProfile.userId) ||
                              commentReply.userId === userProfile.userId,
                            commentReply.id
                          )
                        "
                        v-show="commentReply.isShowDelete"
                        >删除</span
                      >
                    </div>
                  </div>
                  <div class="reply-detail-comment-reply-content">{{ commentReply.content }}</div>
                  <div class="reply-detail-comment-reply-bottom">
                    <div class="reply-detail-comment-reply-time">{{ commentReply.createTime }}</div>
                    <div class="reply-detail-comment-reply-operation-bottom-right">
                      <div
                        class="reply-detail-comment-reply-bottom-reply-btn"
                        @click="handleReply(commentReply.id, index, lv2ReplyIndex, true)"
                      >
                        回复
                      </div>
                      <div class="heart-click">
                        点赞
                        <span>0</span>
                      </div>
                      <div class="down-click">点踩</div>
                    </div>
                  </div>
                </div>
                <reply
                  :momentId="item.momentId"
                  :replyAtCommentId="commentReply.id"
                  :customStyle="style"
                  v-if="commentReply.isShowReply"
                  :maxLength="500"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
    <p class="loading" v-if="loadList?.length < replyTextList?.length">加载中...</p>
    <p class="reachBottom" v-else>已经到底了哦~</p>
  </div>
</template>

<style lang="less" scoped>
.loading,
.reachBottom {
  color: #ccc;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.heart-click,
.down-click {
  cursor: pointer;
}
.heart-click span {
  margin-left: 8px;
  margin-top: 1px;
  margin-right: 18px;
}
.reply-list-head {
  padding: 0 50px;
  height: 50px;
  display: flex;
  align-items: center;
  .reply-filter {
    display: flex;
    span {
      vertical-align: top;
      text-align: center;
      cursor: pointer;
      font-size: 16px;
      height: 50px;
      line-height: 50px;
      position: relative;
    }
    span + span {
      margin-left: 40px;
    }
  }
}
.reply-list-empty {
  color: #ccc;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.reply-list-body {
  border-bottom: 1px solid #eee;
  .reply-detail {
    display: flex;
    padding: 24px 50px;
    overflow: visible;
    background-color: #fff;
    font-size: 14px;
    color: #666;
    .reply-detail-left .user-avatar {
      margin-right: 10px;
    }
    .reply-detail-left .user-avatar img {
      width: 44px;
      border-radius: 50%;
      // border: 1px solid #ebebeb;
      vertical-align: top;
    }
    .reply-detail-container {
      flex: 1;
      position: relative;
      width: 100%;
      overflow: visible;
      .reply-detail-header {
        display: flex;
        padding-top: 2px;
        margin-bottom: 10px;
        .reply-detail-account {
          flex-grow: 1;
        }
        .reply-detail-operation-top {
          width: 40px;
          height: 20px;
          cursor: pointer;
          span {
            padding: 5px;
            border-radius: 10px;
            background-color: #ccc;
          }
        }
      }
      .reply-detail-content {
        padding: 20px 0;
      }
      .reply-detail-operation-bottom {
        display: flex;
        justify-content: space-between;
        color: #ccc;
        .reply-detail-operation-bottom-right {
          display: flex;
          align-items: center;
          .reply-detail-bottom-reply-btn {
            line-height: 14px;
            margin-right: 15px;
            cursor: pointer;
            border-right: 1px solid #ccc;
            padding: 0 15px;
          }
        }
      }
      .reply-detail-replies {
        padding: 15px;
        background-color: #f7f8fc;
        border-radius: 8px;
        margin-top: 20px;
        overflow: hidden;
        .reply-detail-comment-reply-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .reply-detail-comment-reply-operation-top {
            width: 40px;
            height: 20px;
            cursor: pointer;
          }
          .reply-detail-comment-reply-account-at {
            margin: 0 6px;
            color: #ccc;
          }
          .reply-detail-comment-reply-account a {
            display: flex;
            align-items: center;
            color: #00b2ff;
            img {
              width: 24px;
              margin: 0 8px 0 0;
            }
          }
        }
        .reply-detail-comment-reply-content {
          margin-top: 3px;
          font-size: 14px;
          padding-left: 32px;
          line-height: 24px;
          color: #666;
          overflow: hidden;
        }
        .reply-detail-comment-reply-bottom {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          color: #ccc;
          .reply-detail-comment-reply-operation-bottom-right {
            display: flex;
            align-items: center;
            .reply-detail-comment-reply-bottom-reply-btn {
              line-height: 14px;
              margin-right: 15px;
              cursor: pointer;
              border-right: 1px solid #ccc;
              padding: 0 15px;
            }
          }
        }
      }
    }
  }
}
.active {
  color: #00c3ff;
  font-weight: 600;
  border-bottom: 3px solid #00c3ff;
}
</style>
