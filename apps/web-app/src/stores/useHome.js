// import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import kuronekoRequest from '@/service/index'
import { createEditor } from '@wangeditor/editor'

export const useHomeStore = defineStore('home', {
  state: () => {
    return {
      momentList: [],
      isSearch: false,
      searchList: [],
      labelList: []
    }
  },
  getters: {
    getMomentById(state) {
      return (id) => {
        return state.momentList.find((i) => i.id == id)
      }
    }
  },
  actions: {
    async getMomentList() {
      const { data } = await kuronekoRequest.get({ url: '/moment' })
      //适配小程序，editor内容由保存json格式转为保存html格式
      //将之前保存的json格式转为html格式保存
      for (const e of data) {
        if (!e.html) await this.saveMomentHtmlData(e)
      }
      const { data: momentData } = await kuronekoRequest.get({ url: '/moment' })
      this.momentList = momentData
    },
    async getLabelList() {
      const { data } = await kuronekoRequest.get({ url: '/label' })
      this.labelList = data
    },
    handleSearch(tagName) {
      const keywords = tagName.trim()
      this.isSearch = false
      this.searchList = []
      if (!this.isSearch && keywords?.length) {
        this.momentList.forEach((v) => {
          if (JSON.stringify(v.labelList).indexOf(keywords) !== -1) {
            this.searchList.push(v)
          }
        })
        if (this.searchList?.length) {
          this.isSearch = true
        }
      }
    },
    async saveMomentHtmlData(momentData) {
      const editor = createEditor({ content: JSON.parse(momentData.content) })
      const htmlData = editor.getHtml()
      await kuronekoRequest.patch({
        url: `/moment/${momentData.id}/html`,
        data: { html: htmlData }
      })
    }
  }
})
