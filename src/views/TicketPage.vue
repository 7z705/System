<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { getCurrentUser, logout } from '../stores/auth'
import { initialTickets } from '../stores/tickets'

const router = useRouter()
const currentUser = ref(getCurrentUser())
const tickets = ref(initialTickets.map((item) => ({ ...item })))
const chartRef = ref(null)
let chartInstance = null

const isAdmin = computed(() => currentUser.value?.role === 'admin')

const projectSummary = computed(() => {
  const totals = tickets.value.reduce((acc, item) => {
    acc[item.project] = (acc[item.project] ?? 0) + item.hours
    return acc
  }, {})

  return Object.entries(totals).map(([project, hours]) => ({
    project,
    hours: Number(hours.toFixed(1))
  }))
})

function renderChart() {
  if (!chartRef.value) {
    return
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      data: projectSummary.value.map((item) => item.project),
      axisLabel: {
        interval: 0,
        rotate: 15
      }
    },
    yAxis: {
      type: 'value',
      name: '累计工时'
    },
    series: [
      {
        name: '累计工时',
        type: 'bar',
        barWidth: 42,
        itemStyle: {
          color: '#1f8efa',
          borderRadius: [8, 8, 0, 0]
        },
        data: projectSummary.value.map((item) => item.hours)
      }
    ]
  })
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除工单 ${row.id} 吗？`, '提示', {
      type: 'warning'
    })

    tickets.value = tickets.value.filter((item) => item.id !== row.id)
    ElMessage.success('工单已删除')
  } catch {
    return
  }
}

function handleLogout() {
  logout()
  router.push('/login')
}

function handleResize() {
  chartInstance?.resize()
}

watch(
  tickets,
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true }
)

onMounted(async () => {
  await nextTick()
  renderChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div class="ticket-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Workbench</p>
        <h1>工单管理面板</h1>
        <p class="header-meta">
          当前用户：{{ currentUser?.username }}
          <span class="role-tag">{{ isAdmin ? '管理员' : '普通用户' }}</span>
        </p>
      </div>

      <el-button plain @click="handleLogout">退出登录</el-button>
    </header>

    <section class="content-grid">
      <el-card class="table-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>工单列表</span>
            <span class="sub-text">共 {{ tickets.length }} 条</span>
          </div>
        </template>

        <el-table :data="tickets" stripe>
          <el-table-column prop="id" label="ID" width="90" />
          <el-table-column prop="project" label="Project" min-width="220" />
          <el-table-column label="Overtime" width="120">
            <template #default="{ row }">
              <el-tag :type="row.overtime ? 'danger' : 'info'">
                {{ row.overtime ? 'Yes' : 'No' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="hours" label="Hours" width="110" />
          <el-table-column prop="created_at" label="Created At" min-width="180" />
          <el-table-column v-if="isAdmin" label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>项目累计工时</span>
            <span class="sub-text">按表格数据实时汇总</span>
          </div>
        </template>

        <div ref="chartRef" class="chart-container"></div>
      </el-card>
    </section>
  </div>
</template>
