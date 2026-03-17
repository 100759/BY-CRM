import { useEffect, useState } from 'react'
import { useAuthStore, useCustomerStore, useStatsStore } from '../store'
import { api } from '../api'
import CustomerList from '../components/CustomerList'
import CustomerForm from '../components/CustomerForm'
import Dashboard from '../components/Dashboard'

export default function MainPage() {
  const { user, logout } = useAuthStore()
  const { customers, setCustomers } = useCustomerStore()
  const { stats, setStats } = useStatsStore()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'add'>('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [customersRes, statsRes] = await Promise.all([
        api.getCustomers(),
        api.getStats(),
      ])
      setCustomers(customersRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">保研销售 CRM</h1>
            <p className="text-sm text-gray-600">欢迎, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            退出登录
          </button>
        </div>
      </nav>

      {/* 标签页 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            仪表板
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'customers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            客户列表
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'add'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            添加客户
          </button>
        </div>

        {/* 内容区域 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard stats={stats} />}
            {activeTab === 'customers' && <CustomerList customers={customers} onRefresh={loadData} />}
            {activeTab === 'add' && (
              <CustomerForm
                onSuccess={() => {
                  setActiveTab('customers')
                  loadData()
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
