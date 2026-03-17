import { useState, useEffect } from 'react'
import { Customer, FollowUp } from '../store'
import { api } from '../api'

interface CustomerDetailProps {
  customer: Customer
  onBack: () => void
  onRefresh: () => void
}

export default function CustomerDetail({ customer, onBack, onRefresh }: CustomerDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [newFollowUp, setNewFollowUp] = useState('')
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(customer)

  useEffect(() => {
    loadFollowUps()
  }, [customer.id])

  const loadFollowUps = async () => {
    try {
      const result = await api.getFollowUps(customer.id)
      setFollowUps(result.data)
    } catch (error) {
      console.error('加载跟进记录失败:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await api.updateCustomer(customer.id, formData)
      onRefresh()
      setIsEditing(false)
    } catch (error) {
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFollowUp = async () => {
    if (!newFollowUp.trim()) {
      alert('请输入跟进内容')
      return
    }

    try {
      setLoading(true)
      await api.createFollowUp(customer.id, newFollowUp, followUpDate)
      setNewFollowUp('')
      setFollowUpDate(new Date().toISOString().split('T')[0])
      loadFollowUps()
    } catch (error) {
      alert('添加跟进记录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ← 返回列表
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-600 mt-1">{formData.email}</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              编辑
            </button>
          )}
        </div>

        {isEditing ? (
          <EditForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={() => {
              setIsEditing(false)
              setFormData(customer)
            }}
            loading={loading}
          />
        ) : (
          <ViewForm formData={formData} />
        )}
      </div>

      <FollowUpSection
        followUps={followUps}
        newFollowUp={newFollowUp}
        setNewFollowUp={setNewFollowUp}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        onAddFollowUp={handleAddFollowUp}
        loading={loading}
      />
    </div>
  )
}

function EditForm({ formData, setFormData, onSave, onCancel, loading }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="姓名"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="邮箱"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="电话"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          value={formData.undergraduate_school || ''}
          onChange={(e) => setFormData({ ...formData, undergraduate_school: e.target.value })}
          placeholder="本科院校"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          value={formData.major || ''}
          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
          placeholder="专业"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="0.01"
          value={formData.gpa || ''}
          onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
          placeholder="GPA"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          value={formData.target_school || ''}
          onChange={(e) => setFormData({ ...formData, target_school: e.target.value })}
          placeholder="目标院校"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          value={formData.target_major || ''}
          onChange={(e) => setFormData({ ...formData, target_major: e.target.value })}
          placeholder="目标专业"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          value={formData.budget || ''}
          onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
          placeholder="预算"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={formData.stage}
          onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="初次接触">初次接触</option>
          <option value="需求沟通">需求沟通</option>
          <option value="方案制定">方案制定</option>
          <option value="签约">签约</option>
        </select>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
        </select>
      </div>
      <textarea
        value={formData.notes || ''}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="备注"
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '保存中...' : '保存'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
        >
          取消
        </button>
      </div>
    </div>
  )
}

function ViewForm({ formData }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-sm text-gray-600">电话</p>
        <p className="text-lg font-medium text-gray-900">{formData.phone || '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">本科院校</p>
        <p className="text-lg font-medium text-gray-900">{formData.undergraduate_school || '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">专业</p>
        <p className="text-lg font-medium text-gray-900">{formData.major || '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">GPA</p>
        <p className="text-lg font-medium text-gray-900">{formData.gpa || '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">目标院校</p>
        <p className="text-lg font-medium text-gray-900">{formData.target_school || '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">目标专业</p>
        <p className="text-lg font-medium text-gray-900">{formData.target_major || '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">预算</p>
        <p className="text-lg font-medium text-gray-900">{formData.budget ? `¥${formData.budget}` : '-'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">销售阶段</p>
        <p className="text-lg font-medium text-gray-900">{formData.stage}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">状态</p>
        <p className="text-lg font-medium text-gray-900">{formData.status}</p>
      </div>
      {formData.notes && (
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600">备注</p>
          <p className="text-gray-900 whitespace-pre-wrap">{formData.notes}</p>
        </div>
      )}
    </div>
  )
}

function FollowUpSection({ followUps, newFollowUp, setNewFollowUp, followUpDate, setFollowUpDate, onAddFollowUp, loading }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">跟进记录</h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
        <input
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <textarea
          value={newFollowUp}
          onChange={(e) => setNewFollowUp(e.target.value)}
          placeholder="记录跟进内容..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={onAddFollowUp}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '添加中...' : '添加跟进记录'}
        </button>
      </div>

      {followUps.length === 0 ? (
        <p className="text-gray-600 text-center py-8">暂无跟进记录</p>
      ) : (
        <div className="space-y-4">
          {followUps.map((followUp: FollowUp) => (
            <div key={followUp.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">
                    {new Date(followUp.follow_up_date).toLocaleDateString('zh-CN')}
                  </p>
                  <p className="text-gray-900 mt-1">{followUp.content}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(followUp.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
