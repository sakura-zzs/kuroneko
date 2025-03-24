<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/useUser'
import { localCache } from '@/utils/cache'
import { useHomeStore } from '@/stores/useHome'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const { isAvatarUrl, loginStatus, isLogin } = storeToRefs(userStore)

const login = () => {
  if (!loginStatus.value) {
    //隐藏滚动条
    document.body.style.overflow = 'hidden'
    isLogin.value = true
  }
}

//查询
const input1 = ref()
const homeStore = useHomeStore()
const Searching = () => {
  homeStore.handleSearch(input1.value)
}

//登录窗口
const userMenuRef = ref()
const showUserMenu = () => {
  //登录后才显示
  if (!userMenuRef.value || !loginStatus.value) return
  userMenuRef.value.handleOpen()
}
const hideUserMenu = () => {
  if (!userMenuRef.value || !loginStatus.value) return
  userMenuRef.value.handleClose()
}
const logout = () => {
  localCache.clear()
  userStore.$reset()
  ElMessage('退出登录！')
}
const router = useRouter()
const GoToUserPage = () => {
  router.push(`/user/${userStore.userProfile.userId}`)
}
</script>

<template>
  <div class="nav">
    <div class="header_container">
      <div class="header_logo">
        <img src="@/assets/image/kuroneko-logo.png" alt="logo" />
      </div>
      <div class="header_navbar">
        <el-menu
          mode="horizontal"
          class="nav_wrap"
          menu-trigger="click"
          active-text-color="#ff1234"
          default-active="/home"
          router
        >
          <el-menu-item index="/home">主页</el-menu-item>
          <el-menu-item index="2">测试1</el-menu-item>
          <el-menu-item index="3">测试2</el-menu-item>
          <el-menu-item index="4">测试3</el-menu-item>
        </el-menu>
      </div>
      <div class="header_right">
        <el-input v-model="input1" class="w-50 m-2" size="large" placeholder="支持标签搜索">
          <template #suffix>
            <i-ep-search style="cursor: pointer" @click="Searching" />
          </template>
        </el-input>
        <div class="avatar" @click="login" @mouseenter="showUserMenu">
          <el-dropdown ref="userMenuRef" trigger="contextmenu">
            <span class="el-dropdown-link"
              ><img v-if="!isAvatarUrl" src="@/assets/image/user_default.png" />
              <img v-else :src="isAvatarUrl" />
            </span>
            <template #dropdown>
              <el-dropdown-menu @mouseleave="hideUserMenu">
                <el-dropdown-item @click="GoToUserPage">个人中心</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.nav {
  display: flex;
  justify-content: center;
  .header_container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 1200px;
    .header_logo {
      height: 60px;
      display: flex;
      align-items: center;
      img {
        width: 150px;
      }
      .logo_title {
        color: #fff;
      }
    }
    .header_navbar {
      .el-menu {
        width: 600px;
        padding-left: 50px;
        background-color: #1f2233;
        .el-menu-item {
          width: 68px;
          color: #fff;
          font-size: 14px;
        }
        .el-menu-item:hover,
        :focus {
          background-color: rgba(255, 255, 255, 0.18);
        }
        .el-sub-menu__title {
          background-color: red;
        }
      }
    }
    .header_right {
      display: flex;
      width: 250px;
      height: 100%;
      justify-content: space-around;
      align-items: center;
      .el-input {
        width: 150px;
        height: 38px;
      }
      .avatar {
        display: flex;
        align-items: center;
        height: 100%;
        cursor: pointer;
        .el-dropdown {
          width: 100%;
          height: 100%;
          border: none;
          .el-dropdown-link {
            width: 100%;
            img {
              width: 50px;
              margin: 5px 10px 0;
            }
          }
          .el-dropdown-link:focus-visible,
          img:focus-visible {
            outline: none;
          }
        }
      }
    }
    .avatar:hover {
      background-color: rgba(255, 255, 255, 0.18);
    }
  }
}

:deep(.el-menu--horizontal.el-menu) {
  border: none;
}
</style>
