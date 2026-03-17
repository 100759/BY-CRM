import { useState } from 'react'
import { Customer } from '../store'
import { api } from '../api'
import CustomerDetail from './CustomerDetail'

interface CustomerListProps {
  customers: Customer[]
  onRefresh: () => void
}

export default function CustomerList({ customers, onRefresh }: CustomerListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<string>('')

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.includes(searchTerm) || c.email?.includes(searchTerm)
    const matchesStage = !filterStage || c.stage === filterStage
    return matchesSearch && matchesStage
  })

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个客户吗？')) {
      try {
        await api.deleteCustomer(id)
        onRefresh()
      } catch (error) {
        alert('删除失败')
      }
    }
  }

  const stageColors: Record<string, string> = {
    '初次接触': 'bg-blue-100 text-blue-800',
    '需求沟通': 'bg-purple-100 text-purple-800',
    '方案制定': 'bg-yellow-100 text-yellow-800',
    '签约': 'bg-green-100 text-green-800',
  }

  const statusColors: Record<string, string> = {
    '进行中': 'bg-orange-100 text-orange-800',
    '已完成': 'bg-green-100 text-green-800',
  }

  if (selectedCustomer) {
    return (
      <CustomerDetail
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        onRefresh={onRefresh}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <input
            type="text"
            placeholder="搜索客户名称或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">所有阶段</option>
            <option value="初次接触">初次接触</option>
            <option value="需求沟通">需求沟通</option>
            <option value="方案制定">方案制定</option>
            <option value="签约">签约</option>
          </select>
        </div>
      </div>

      {/* 客户列表 */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">暂无客户</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">姓名</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">邮箱</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">目标院校</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">阶段</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">状态</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.target_school || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[customer.stage] || 'bg-gray-100 text-gray-800'}`}>
                        {customer.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[customer.status] || 'bg-gray-100 text-gray-800'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
