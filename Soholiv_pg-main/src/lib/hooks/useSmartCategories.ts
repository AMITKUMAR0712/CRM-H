import { useQuery } from '@tanstack/react-query'
import { smartCategoryApi } from '@/lib/api-client'

export interface SmartCategory {
  id: string
  name: string
  slug: string
  description?: string | null
}

interface SmartCategoryResponse {
  success: boolean
  data: SmartCategory[]
}

export function useSmartCategories() {
  return useQuery<SmartCategoryResponse>({
    queryKey: ['smart-categories'],
    queryFn: () => smartCategoryApi.getAll() as Promise<SmartCategoryResponse>,
    staleTime: 1000 * 60 * 60,
  })
}
