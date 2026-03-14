"use client"
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
const Provider = ({children}:{children:React.ReactNode}) => {
    const queryClient = new QueryClient({
         defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      retry: false,
    },
  },
    })

  return (
    <div className='flex flex-1 flex-col h-full w-full overflow-y-auto'>
    <QueryClientProvider client={queryClient} >
        {children}
    </QueryClientProvider>
    </div>
  )
}

export default Provider