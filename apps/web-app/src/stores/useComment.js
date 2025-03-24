import kuronekoRequest from '@/service'
import { defineStore } from 'pinia'

export const useCommentStore = defineStore('comment', {
  state: () => {
    return {
      commentList: [],
      commentText: []
    }
  },
  getters: {
    getCommentText(state) {
      return () => {
        //提取评论回复文本
        return state.commentList.map((item) => {
          return {
            id: item.id,
            content: JSON.parse(item.content).map((v) => {
              return v.children
                .map((i) => {
                  if (i.text) return i.text
                })
                .join('')
            }),
            userId: item.userId,
            momentId: item.momentId,
            commentId: item.commentId,
            createTime: item.createTime,
            isShowReply: false,
            userInfo: item.userInfo,
            isShowDelete: false,
            //二级评论文本提取
            commentReplyList: item?.commentReplyList?.map((cr) => {
              return {
                id: cr.id,
                content: JSON.parse(cr.content).map((v) => {
                  return v.children
                    .map((i) => {
                      if (i.text) return i.text
                    })
                    .join('')
                })[0],
                userId: cr.userId,
                momentId: cr.momentId,
                commentId: cr.commentId,
                createTime: cr.createTime,
                isShowReply: false,
                replyAtUser: cr.replyToUser,
                userInfo: cr.userInfo,
                isShowDelete: false
              }
            })
          }
        })
      }
    },
    getAutherCmt(state) {
      return (autherId) => {
        return state.commentText.filter((i) => i.userId === autherId)
      }
    }
  },
  actions: {
    async getCommentList(momentId) {
      const { data } = await kuronekoRequest.get({
        url: `/comment/topComments/${momentId}`
      })
      this.commentList = data
      await this.getCommentReplyList()
    },
    async getCommentReplyList() {
      //获取所有评论回复和评论所在评论的用户信息，并混入到评论数据中
      const promises = this.commentList.map((i) =>
        kuronekoRequest.get({
          url: `/comment/${i.id}`
        })
      )
      const res = await Promise.all(promises)
      res.forEach((v, i) => {
        this.commentList[i].commentReplyList = v.data
      })
      this.commentText = this.getCommentText()
    }
  },
  persist: true
})
