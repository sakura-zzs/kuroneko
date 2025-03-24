import kuronekoRequest from '@/service'
import { defineStore } from 'pinia'

export const useArticleStore = defineStore('article', {
  state: () => {
    return {
      labelList: []
    }
  },
  getters: {
    getLabelNameList(state) {
      return state.labelList.map((i) => i.name)
    }
  },
  actions: {
    async getLabelList() {
      const { data } = await kuronekoRequest.get({ url: '/label' })
      this.labelList = data
    }
  }
})
