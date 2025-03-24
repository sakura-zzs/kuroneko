import { defineStore } from 'pinia'
import kuronekoRequest from '@/service/index'
import { localCache } from '@/utils/cache'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userProfile: {},
      loginStatus: false,
      isAvatarUrl: null,
      //控制登录窗口显示隐藏
      isLogin: false,
      userCommentList: [],
      otherUserProfile: []
    }
  },
  getters: {},
  actions: {
    //当前登录用户信息
    async getUserProfile() {
      const id = localCache.getItem('id')
      const { data } = await kuronekoRequest.get({ url: `/user/profile?id=${id}` })
      this.userProfile = data[0]
      this.isAvatarUrl = this.userProfile.avatar.url
    },
    async getUserCommentList(id) {
      const { data } = await kuronekoRequest.get({ url: `comment/user/${id}` })
      this.userCommentList = data
    },
    //点击用户头像获取的用户信息
    async getOtherUserProfile(id) {
      const { data } = await kuronekoRequest.get({ url: `/user/profile?id=${id}` })
      this.otherUserProfile = data[0]
    }
  },
  //持久化
  persist: true
})
