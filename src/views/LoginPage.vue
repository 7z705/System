<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../stores/auth'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

async function handleLogin() {
  if (!form.username.trim() || !form.password.trim()) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true

  try {
    login(form.username)
    ElMessage.success('登录成功')
    router.push('/tickets')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-header">
        <p class="eyebrow">Ticket Center</p>
        <h1>工单管理系统</h1>
        <p>用户名为 `admin` 时进入管理员权限，其余账号为普通用户。</p>
      </div>

      <el-form label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="submit-button"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>
