import kuronekoRequest from '@/service'
import { useUserStore } from '@/stores/useUser'
const userStore = useUserStore()
export default async function checkLogin() {
  const loginStatusInfo = await kuronekoRequest.get({ url: '/authTest' })
  if (loginStatusInfo.data.code === 1006) {
    userStore.$reset()
    ElMessage('请先登录！')
    userStore.isLogin = true
    return false
  }
  return true
}
