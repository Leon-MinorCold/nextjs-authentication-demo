import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserInfo, UserStore } from '@/types/user'

const useUserStore = create<UserStore>()(
	persist(
		set => ({
			user: null,
			isInitialized: false,
			isAuthenticated: false,
			setUser: (user: UserInfo | null) =>
				set({
					user,
					isAuthenticated: !!user,
					isInitialized: true,
				}),
			logout: () =>
				set({
					user: null,
					isAuthenticated: false,
					isInitialized: true,
				}),
			setInitialized: initialized => set({ isInitialized: initialized }),
		}),
		{
			name: 'user-storage', // 存储的名称
			storage: createJSONStorage(() => sessionStorage), // 使用 sessionStorage
			partialize: state => ({ user: state.user }), // 只持久化 user 数据
		}
	)
)

export default useUserStore
