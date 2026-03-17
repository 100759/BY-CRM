import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  phone?: string
  email?: string
  undergraduate_school?: string
  major?: string
  gpa?: number
  target_school?: string
  target_major?: string
  budget?: number
  stage: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface FollowUp {
  id: string
  customer_id: string
  user_id: string
  content: string
  follow_up_date: string
  created_at: string
}

interface AuthStore {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
}

interface CustomerStore {
  customers: Customer[]
  selectedCustomer: Customer | null
  followUps: FollowUp[]
  setCustomers: (customers: Customer[]) => void
  setSelectedCustomer: (customer: Customer | null) => void
  setFollowUps: (followUps: FollowUp[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (customer: Customer) => void
  removeCustomer: (id: string) => void
  addFollowUp: (followUp: FollowUp) => void
}

interface StatsStore {
  stats: any
  setStats: (stats: any) => void
}

export const useAuthStore = create<AuthStore>((set) => {
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    login: (token, user) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user })
    },
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ token: null, user: null })
    },
    setUser: (user) => set({ user }),
  }
})

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  selectedCustomer: null,
  followUps: [],
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setFollowUps: (followUps) => set({ followUps }),
  addCustomer: (customer) => set((state) => ({
    customers: [customer, ...state.customers]
  })),
  updateCustomer: (customer) => set((state) => ({
    customers: state.customers.map(c => c.id === customer.id ? customer : c)
  })),
  removeCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id)
  })),
  addFollowUp: (followUp) => set((state) => ({
    followUps: [followUp, ...state.followUps]
  })),
}))

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}))
