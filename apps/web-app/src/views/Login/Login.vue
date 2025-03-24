<script setup>
import { ref, reactive } from 'vue'
import kuronekoRequest from '@/service'
import { localCache } from '@/utils/cache'
import { useUserStore } from '@/stores/useUser'
const userStore = useUserStore()
const loginFormRef = ref()
const loginForm = reactive({
  email: '',
  pass: ''
})
//验证邮箱和密码格式
const reg = /^[0-9a-zA-Z_-]+@[0-9a-zA-Z_-]+(.[0-9a-zA-Z_-]+)+$/
const pwdReg = /^[0-9a-zA-Z]{6,16}$/
const validateEmail = (rule, value, cb) => {
  const emailIsTrue = reg.test(value)
  if (!emailIsTrue) {
    cb(new Error('请检查邮箱输入！'))
  }
  cb()
}
const validatePass = (rule, value, cb) => {
  const passIsTrue = pwdReg.test(value)
  if (!passIsTrue) {
    cb(new Error('请检查密码！'))
  }
  cb()
}
//校验规则
const loginRules = reactive({
  email: [{ validator: validateEmail, trigger: 'blur' }],
  pass: [{ validator: validatePass, trigger: 'blur' }]
})

//登录
const submitForm = async (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (!valid) {
      return false
    }
  })
  const { data } = await kuronekoRequest.post({
    url: '/login',
    data: {
      email: loginForm.email,
      pwd: loginForm.pass
    }
  })
  if (data.token) {
    localCache.setItem('token', data.token)
    localCache.setItem('id', data.id)
    emit('hideLoginCard', false)
    ElMessage({
      showClose: true,
      message: '登录成功！',
      center: true,
      type: 'success'
    })
    document.body.style.overflow = ''
    userStore.loginStatus = true
    await userStore.getUserProfile()
  }
}

//重置表单
const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
}

//关闭按钮
const emit = defineEmits(['hideLoginCard'])
const closeLoginCard = () => {
  //显示滚动条
  document.body.style.overflow = ''
  emit('hideLoginCard', false)
}
</script>

<template>
  <el-card class="login-card">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="loginForm.email" type="email" placeholder="请输入邮箱账号：" />
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input
          v-model="loginForm.pass"
          type="password"
          placeholder="请输入6-16位的大小写字母加数字："
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(loginFormRef)">登录</el-button>
        <el-button @click="resetForm(loginFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <el-icon class="close-login-card" :size="24" color="#86c187" @click="closeLoginCard">
      <i-ep-close-bold />
    </el-icon>
  </el-card>
</template>

<style lang="less" scoped>
.login-card {
  position: relative;
  top: 50%;
  width: 430px;
  height: 480px;
  transform: translateY(-50%);
  margin: 0 auto;
  border-radius: 12px;
  background-image: url(@/assets/image/seaside-kuroneko.jpg);
  background-size: cover;
  :deep(.el-form) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .close-login-card {
    position: absolute;
    right: 12px;
    top: 12px;
    border-radius: 4px;
    padding: 2px;
  }
  .close-login-card:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
