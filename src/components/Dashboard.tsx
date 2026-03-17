interface DashboardProps {
  stats: any
}

export default function Dashboard({ stats }: DashboardProps) {
  if (!stats) {
    return <div className="text-center py-12 text-gray-600">暂无数据</div>
  }

  const stages = [
    { label: '初次接触', value: stats.stage_initial || 0, color: 'bg-blue-100 text-blue-800' },
    { label: '需求沟通', value: stats.stage_communication || 0, color: 'bg-purple-100 text-purple-800' },
    { label: '方案制定', value: stats.stage_proposal || 0, color: 'bg-yellow-100 text-yellow-800' },
    { label: '签约', value: stats.stage_signed || 0, color: 'bg-green-100 text-green-800' },
  ]

  return (
    <div className="space-y-6">
      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">总客户数</div>
          <div className="text-4xl font-bold text-gray-900 mt-2">{stats.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">进行中 / 已完成</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.status_ongoing || 0} / {stats.status_completed || 0}
          </div>
        </div>
      </div>

      {/* 销售阶段分布 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">销售阶段分布</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => (
            <div key={stage.label} className={`${stage.color} rounded-lg p-4`}>
              <div className="text-sm font-medium">{stage.label}</div>
              <div className="text-3xl font-bold mt-2">{stage.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 进度条 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">销售漏斗</h2>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const percentage = stats.total ? (stage.value / stats.total) * 100 : 0
            return (
              <div key={stage.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                  <span className="text-sm font-medium text-gray-600">{stage.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-purple-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
