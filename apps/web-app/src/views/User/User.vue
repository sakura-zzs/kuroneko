<template>
  <div>
    <el-container class="main-container">
      <div class="main-content">
        <el-header class="main-content-header">
          <div class="account-center-avatar">
            <img
              v-if="!otherUserProfile?.avatar?.url"
              src="../../assets/image/user_default.png"
              alt=""
            />
            <img v-else :src="otherUserProfile?.avatar?.url" alt="" />
          </div>
          <div class="account-center-user-info">
            <div class="account-center-user-info-header">
              <span>{{ otherUserProfile?.profile?.nickName }}</span>
              <el-button
                v-if="userProfile.userId === otherUserProfile.userId"
                plain
                @click="goToEditProfile"
                >编辑</el-button
              >
            </div>
            <div class="account-center-user-info-intro">
              {{ otherUserProfile?.profile?.selfProfile }}
            </div>
            <div class="account-center-user-info-data"><span>333</span><span>获赞数</span></div>
          </div>
        </el-header>
        <el-main>
          <el-tabs v-model="labelName" tab-position="left" class="demo-tabs">
            <el-tab-pane label="我的发帖" name="0">
              <template #label>
                <div class="accountCenter-item">
                  <el-icon><i-ep-tickets /></el-icon
                  ><span>{{
                    userProfile.userId === otherUserProfile.userId ? '我的发帖' : '发帖'
                  }}</span>
                </div>
              </template>
              <div class="main-content-container">
                <div class="main-content-container-header">
                  {{ userProfile.userId === otherUserProfile.userId ? '我的发帖' : '发帖' }}
                </div>
                <el-card>
                  <ActicleCard :isLabelClick="false" :userMomentList="userMomentList" />
                </el-card>
              </div>
            </el-tab-pane>
            <el-tab-pane label="我的评论" name="1"
              ><template #label>
                <div class="accountCenter-item">
                  <el-icon><i-ep-comment /></el-icon
                  ><span>{{
                    userProfile.userId === otherUserProfile.userId ? '我的评论' : '评论'
                  }}</span>
                </div>
              </template>
              <div class="main-content-container">
                <div class="main-content-container-header">
                  {{ userProfile.userId === otherUserProfile.userId ? '我的评论' : '评论' }}
                </div>
                <el-card>
                  <div class="main-content-container-list">
                    <div
                      class="main-content-container-list-item"
                      v-for="item in userCommentList"
                      :key="item.id"
                    >
                      <div class="main-content-container-list-item-header">
                        {{ item.createTime }}
                      </div>
                      <div
                        class="main-content-container-list-item-reply-card"
                        @click="goToMoment(item.momentId)"
                      >
                        <div class="main-content-container-list-item-reply-card-content">
                          {{ JSON.parse(item.content)[0].children[0].text }}
                        </div>
                        <div class="main-content-container-list-item-reply-card-origin">
                          <span v-if="item.ReplyInfo.momentTitle">
                            回复帖子: {{ item.ReplyInfo.momentTitle }}
                          </span>
                          <span v-else
                            >回复评论:
                            {{ JSON.parse(item.ReplyInfo.content)[0].children[0].text }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>
            <el-tab-pane
              v-if="userProfile.userId === otherUserProfile.userId"
              label="编辑资料"
              name="2"
              ><template #label>
                <div class="accountCenter-item">
                  <el-icon><i-ep-user-filled /></el-icon><span>编辑资料</span>
                </div>
              </template>
              <div class="main-content-container">
                <div class="main-content-container-header">编辑资料</div>
                <div class="account-info-edit-content">
                  <div class="account-info-edit-avatar">
                    <img
                      class="current-img"
                      v-if="otherUserProfile?.avatar?.url"
                      :src="otherUserProfile?.avatar?.url"
                      alt=""
                    />
                    <el-upload
                      limit="1"
                      action="#"
                      list-type="picture-card"
                      v-model:file-list="fileList"
                      :auto-upload="false"
                      :disabled="isUpload"
                      :on-change="uploadAvatar"
                      accept="image/png, image/gif, image/jpg, image/jpeg"
                    >
                      <el-icon><i-ep-plus /></el-icon>
                      <template #file="{ file }">
                        <div>
                          <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                          <span class="el-upload-list__item-actions">
                            <span
                              class="el-upload-list__item-preview"
                              @click="handlePictureCardPreview(file)"
                            >
                              <el-icon><i-ep-zoom-in /></el-icon>
                            </span>
                            <span
                              v-if="!disabled"
                              class="el-upload-list__item-delete"
                              @click="handleDownload(file)"
                            >
                              <el-icon><i-ep-download /></el-icon>
                            </span>
                            <span
                              v-if="!disabled"
                              class="el-upload-list__item-delete"
                              @click="handleRemove(file)"
                            >
                              <el-icon><i-ep-delete /></el-icon>
                            </span>
                          </span>
                        </div>
                      </template>
                    </el-upload>

                    <el-dialog v-model="dialogVisible">
                      <img w-full :src="dialogImageUrl" alt="Preview Image" />
                    </el-dialog>
                  </div>
                  <div class="account-info-edit-form">
                    <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules">
                      <el-form-item prop="nickName">
                        <div class="account-form-nick-name account-info-edit-form-item">
                          <span>昵称</span>
                          <el-input
                            v-model="profileForm.nickName"
                            maxlength="10"
                            placeholder="Please input"
                            show-word-limit
                            type="text"
                          >
                          </el-input>
                        </div>
                      </el-form-item>
                      <div class="account-form-sex account-info-edit-form-item">
                        <span>性别</span>
                        <el-radio-group v-model="profileForm.sex">
                          <el-radio label="male">男</el-radio>
                          <el-radio label="female">女</el-radio>
                          <el-radio label="unknow">未知</el-radio>
                        </el-radio-group>
                      </div>
                      <div class="account-form-intro account-info-edit-form-item">
                        <span>个性签名</span>
                        <el-input
                          v-model="profileForm.selfProfile"
                          maxlength="48"
                          placeholder="Please input"
                          show-word-limit
                          type="textarea"
                          resize="none"
                        >
                        </el-input>
                      </div>
                      <div class="account-form-birth account-info-edit-form-item">
                        <span>出生日期</span>
                        <el-date-picker
                          v-model="profileForm.birth"
                          type="date"
                          placeholder="Pick a day"
                        />
                      </div>
                      <div class="account-form-location account-info-edit-form-item">
                        <span>地点</span>
                        <el-input
                          v-model="profileForm.location"
                          maxlength="10"
                          placeholder="Please input"
                          show-word-limit
                          type="text"
                        >
                        </el-input>
                      </div>
                    </el-form>
                  </div>
                  <div class="account-info-edit-footer">
                    <el-button class="custom-button" plain @click="handleSubmit">保存</el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="userProfile.userId === otherUserProfile.userId" label="退出登录"
              ><template #label>
                <div class="accountCenter-item" @click="logout">
                  <el-icon><i-ep-switch-button /></el-icon><span>退出登录</span>
                </div>
              </template></el-tab-pane
            >
          </el-tabs>
        </el-main>
      </div>
    </el-container>
  </div>
</template>

<script setup>
import ActicleCard from '../Home/cpns/ActicleCard.vue'
import { ref, computed, onMounted, reactive } from 'vue'
import { useHomeStore } from '@/stores/useHome'
import { useUserStore } from '@/stores/useUser'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import kuronekoRequest from '@/service'
//使用element-plus集成的dayjs处理日期选择器的格式
import { dayjs } from 'element-plus'
import { localCache } from '@/utils/cache'

const labelName = ref('0')
const goToEditProfile = () => {
  labelName.value = '2'
}

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove = () => {
  // 清空文件
  fileList.value.splice(0, 1)
  isUpload.value = false
}
//大图预览
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const handleDownload = (file) => {
  //通过a标签下载文件
  const a = document.createElement('a')
  a.setAttribute('download', file.name)
  a.setAttribute('target', '_blank')
  a.setAttribute('href', file.url)
  a.click()
}

const homeStore = useHomeStore()
const userStore = useUserStore()
const { userCommentList, userProfile, otherUserProfile } = storeToRefs(userStore)
const userMomentList = computed(() =>
  homeStore.momentList.filter((v) => v.userId === userStore.otherUserProfile.userId)
)
const route = useRoute()
onMounted(async () => {
  const { id } = route.params
  await userStore.getOtherUserProfile(id)
  await userStore.getUserCommentList(id)
})
const router = useRouter()
const goToMoment = (momentId) => {
  router.push(`/article/${momentId}`)
}
//上传文件列表（文件预览列表）
const fileList = ref([])
//上传文件
const uploadAvatar = (file) => {
  //文件预览
  fileList.value.push(file)
  isUpload.value = true
  //限制文件大小不能超过2.5m
  if (file.size / 1024 > 2560) return ElMessage('头像大小不能大于2.5M！')
}
const isUpload = ref(false)
const profileFormRef = ref()
const profileForm = reactive({
  nickName: otherUserProfile.value?.profile?.nickName,
  sex:
    otherUserProfile.value?.profile?.sex == '男'
      ? 'male'
      : otherUserProfile.value?.profile?.sex == '女'
      ? 'female'
      : 'unKnow',
  selfProfile: otherUserProfile.value?.profile?.selfProfile,
  birth: otherUserProfile.value?.profile?.birth,
  location: otherUserProfile.value?.profile?.location
})
const profileRules = reactive({
  nickName: [{ required: true, message: 'Please input Activity name', trigger: 'blur' }]
})
const handleSubmit = async () => {
  if (fileList.value.length) {
    const formData = new FormData()
    formData.append('avatarImg', fileList.value[0].raw)
    console.log(formData.get('avatarImg'))
    await kuronekoRequest.post({
      url: '/upload/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    //更新用户个人信息
    await userStore.getUserProfile()
    fileList.value.splice(0, 1)
    ElMessage({
      type: 'success',
      message: '头像更新成功！'
    })
  }
  const sex = profileForm.sex == 'male' ? '男' : profileForm.sex == 'female' ? '女' : '未知'
  const birth = dayjs(profileForm.birth).format('YYYY-MM-DD')

  if (
    profileForm.nickName.trim() == otherUserProfile.value.profile.nickName &&
    sex == otherUserProfile.value.profile.sex &&
    profileForm.selfProfile.trim() == otherUserProfile.value.profile.selfProfile &&
    birth == otherUserProfile.value.profile.birth &&
    profileForm.location.trim() == otherUserProfile.value.profile.location
  )
    return
  await kuronekoRequest.patch({
    url: 'user/profile',
    data: {
      nickName: profileForm.nickName,
      sex,
      location: profileForm.location,
      selfProfile: profileForm.selfProfile,
      birth
    }
  })
  //更新用户个人信息
  await userStore.getUserProfile()
  ElMessage({
    type: 'success',
    message: '个人信息更新成功！'
  })
}
const logout = () => {
  localCache.clear()
  userStore.$reset()
  ElMessage('退出登录！')
  router.push('/home')
}
</script>

<style lang="less" scoped>
.el-button {
  border-color: #00d5ff;
  color: #00d5ff;
}
.custom-button {
  line-height: 32px;
  width: 106px;
  font-size: 16px;
}
:deep(.el-date-editor--date) {
  margin-left: -10px;
}
.account-info-edit-content {
  padding: 40px 30px 100px;
  .account-info-edit-avatar {
    position: relative;
    width: 120px;
    margin: 0 auto 23px;
    .current-img {
      position: absolute;
      top: 16px;
      left: -140px;
      z-index: 9;
    }
  }
  .account-info-edit-form {
    line-height: 44px;
    overflow: hidden;
    .account-info-edit-form-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      width: 100%;
      span {
        display: flex;
        width: 66px;
        color: #999;
        margin-right: 30px;
        font-size: 14px;
      }
    }
  }
  .account-info-edit-footer {
    text-align: center;
    margin-top: 30px;
  }
}
.main-content-container-list-item {
  padding-top: 24px;
  .main-content-container-list-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    color: #999;
  }
  .main-content-container-list-item-reply-card {
    cursor: pointer;
    flex-grow: 1;
    padding: 24px 30px;
    overflow: hidden;
    .main-content-container-list-item-reply-card-content {
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
    }
    .main-content-container-list-item-reply-card-origin {
      padding: 15px;
      background-color: #f7f8fc;
      border-radius: 4px;
      margin-top: 12px;
      color: #999;
      line-height: 18px;
    }
  }
}
.main-container {
  display: flex;
  justify-content: center;
  // padding: 62px 0;
  .main-content {
    width: 1200px;
    padding: 30px 100px 0;
    color: #333;
    border: none;
    .main-content-header {
      padding: 20px 50px 24px 90px;
      display: flex;
      margin-bottom: 20px;
      .account-center-avatar {
        width: 120px;
        height: 120px;
        margin-right: 24px;
      }
      .account-center-user-info {
        flex-grow: 1;
        .account-center-user-info-header {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          line-height: 21px;
          font-weight: 600;
        }
        .account-center-user-info-intro {
          display: flex;
          margin-top: 12px;
          color: #666;
          line-height: 18px;
        }
        .account-center-user-info-data {
          display: flex;
          padding-top: 19px;
          align-items: center;
          margin-top: 20px;
          border-top: 1px solid #f0f0f0;
          span {
            font-size: 20px;
            color: #333;
          }
          span + span {
            font-size: 14px;
            color: #ccc;
            margin-left: 10px;
          }
        }
      }
    }
    .main-content-container {
      background-color: #fff;
      border-radius: 4px;
      .main-content-container-header {
        width: 100%;
        padding: 0 30px;
        line-height: 50px;
        border-bottom: 1px solid #ebebeb;
        font-size: 16px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
:deep(.el-card__body) {
  padding: 0;
}
:deep(.el-card.is-always-shadow) {
  box-shadow: none;
}
:deep(.el-card) {
  border: none;
  border-radius: none;
}
:deep(.el-icon) {
  width: 18px;
  font-size: 18px;
  vertical-align: top;
  display: inline-block;
  color: #d9d9d9;
  margin-right: 15px;
}
:deep(.el-tabs--left .el-tabs__active-bar.is-left) {
  right: -140px;
}
:deep(.el-tabs__header) {
  width: 280px;
  margin: 0 30px 10px;
  background-color: #fff;
  border-radius: 4px;
}
.accountCenter-item {
  padding: 0 20px;
  line-height: 50px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    color: #00c3ff;
    .el-icon {
      color: #00c3ff;
    }
  }
}

:deep(.el-tabs--left .el-tabs__header.is-left) {
  margin-right: 20px;
}
:deep(.el-tabs__nav-wrap) {
  padding: 0 30px 10px;
}
:deep(.el-tabs__header::before) {
  content: '个人中心';
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  padding: 0 30px;
  line-height: 50px;
  border-bottom: 1px solid #ebebeb;
  font-size: 16px;
}
:deep(.el-header) {
  height: auto;
}
</style>
