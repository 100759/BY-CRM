import { useState } from 'react'
import { api } from '../api'

interface CustomerFormProps {
  onSuccess: () => void
}

export default function CustomerForm({ onSuccess }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    undergraduate_school: '',
    major: '',
    gpa: '',
    target_school: '',
    target_major: '',
    budget: '',
    stage: '初次接触',
    status: '进行中',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      }
      await api.createCustomer(data)
      onSuccess()
    } catch (err: any) {
      setError(err.message || '添加客户失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">添加新客户</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入客户姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              电话
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入电话"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              本科院校
            </label>
            <input
              type="text"
              value={formData.undergraduate_school}
              onChange={(e) => setFormData({ ...formData, undergraduate_school: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入本科院校"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              专业
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入专业"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPA
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入GPA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标院校
            </label>
            <input
              type="text"
              value={formData.target_school}
              onChange={(e) => setFormData({ ...formData, target_school: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入目标院校"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标专业
            </label>
            <input
              type="text"
              value={formData.target_major}
              onChange={(e) => setFormData({ ...formData, target_major: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入目标专业"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              预算 (¥)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入预算"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              销售阶段
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="初次接触">初次接触</option>
              <option value="需求沟通">需求沟通</option>
              <option value="方案制定">方案制定</option>
              <option value="签约">签约</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            备注
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="输入备注信息"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
        >
          {loading ? '添加中...' : '添加客户'}
        </button>
      </form>
    </div>
  )
}
