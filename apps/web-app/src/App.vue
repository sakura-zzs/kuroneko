<script setup>
import Navbar from '@/components/navbar/Navbar.vue'
import Login from '@/views/Login/Login.vue'
import { useUserStore } from './stores/useUser'
import { storeToRefs } from 'pinia'
const { isLogin } = storeToRefs(useUserStore())
const showLoginCard = (flag) => {
  isLogin.value = flag
}
const hideLoginCard = (flag) => {
  isLogin.value = flag
}
</script>
<template>
  <div class="app">
    <el-container class="app_container">
      <div class="nav_container">
        <el-header class="app_nav">
          <navbar @changeIsLogin="showLoginCard" />
        </el-header>
      </div>
      <el-main class="main-container">
        <router-view />
      </el-main>
    </el-container>
    <div class="login-container" v-if="isLogin">
      <login @hideLoginCard="hideLoginCard" />
    </div>
    <el-backtop :right="100" :bottom="100" />
  </div>
</template>

<style lang="less" scoped>
.nav_container {
  position: fixed;
  z-index: 999;
  width: 100%;
}
.app_nav {
  display: flex;
  justify-content: center;
  background-color: #1f2233;
}
.main-container {
  display: flex;
  justify-content: center;
  padding: 62px 0;
}
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
@/stores/useHome
