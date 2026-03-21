declare module 'chat/BookRecommendation' {
  const BookRecommendation: React.ComponentType<{
    emotions?: string[]
    onBack?: () => void
  }>
  export default BookRecommendation
}

declare module 'mfeHost/EmotionStoreInitializer' {
  const EmotionStoreInitializer: React.ComponentType
  export default EmotionStoreInitializer
}

declare module 'mfeHost/sharedEmotionStore' {
  import { UseBoundStore, StoreApi } from 'zustand'
  interface EmotionRecord {
    emotion: string
    intensity: number
    date: string
    source: 'chatbot' | 'manual' | 'imported'
  }
  interface SharedEmotionState {
    emotionRecords: EmotionRecord[]
    setEmotionRecordsFromOrders: (orders: unknown[]) => void
    getRecentWeekRecords: (baseDate?: string) => EmotionRecord[]
  }
  export const useSharedEmotionStore: UseBoundStore<StoreApi<SharedEmotionState>>
}

declare module 'archive/OrderList' {
  const OrderList: React.ComponentType
  export default OrderList
}

declare module 'archive/EmotionCollection' {
  const EmotionCollection: React.ComponentType
  export default EmotionCollection
}

declare module 'auth/authStore' {
  import { UseBoundStore, StoreApi } from 'zustand'
  interface AuthState {
    user: { uid: string; email: string; displayName: string | null; photoURL: string | null } | null
    isLoading: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    initAuthListener: () => () => void
  }
  export const useAuthStore: UseBoundStore<StoreApi<AuthState>>
}

declare module 'auth/energyStore' {
  import { UseBoundStore, StoreApi } from 'zustand'
  interface EnergyState {
    energy: number
    maxEnergy: number
    deductEnergy: (cost: number) => Promise<void>
    restoreEnergy: (amount: number) => Promise<void>
    fetchDailyUsage: (days: number) => Promise<void>
  }
  export const useEnergyStore: UseBoundStore<StoreApi<EnergyState>>
}
