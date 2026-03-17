import { useEffect, useState } from 'react'
import { useAuthStore } from './store'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'

export default function App() {
  const { token, user, setUser } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // 检查本地存储的用户信息
    const storedUser = localStorage.getItem('user')
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
    setIsReady(true)
  }, [token, setUser])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!token || !user) {
    return (
      <LoginPage
        onSuccess={() => {
          // 登录成功后，用户信息已保存到 store
        }}
      />
    )
  }

  return <MainPage />
}
