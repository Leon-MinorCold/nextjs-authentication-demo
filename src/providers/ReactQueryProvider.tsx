'use client'

import { reactQueryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={reactQueryClient}>
			{children}
			{/* <ReactQueryDevtools initialIsOpen={false} />  */}
		</QueryClientProvider>
	)
}
