import { useQuery, useMutation, useQueryClient, useInfiniteQuery }
  from '@tanstack/react-query'
import { jobApi } from '../api/jobApi'
import toast from 'react-hot-toast'

// 🔖 Query Keys — treat like database table names
// Every cached piece of data has a unique key
// ['jobs'] = all jobs cache
// ['jobs', { title: 'java' }] = filtered jobs cache
// ['job', 1] = single job with id 1
export const jobKeys = {
  all:     ()       => ['jobs'],
  list:    filters  => ['jobs', filters],
  detail:  id       => ['job', id],
  my:      filters  => ['myJobs', filters],
}

// ── Get all jobs with filters ──
export function useJobs(filters = {}) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn:  () => jobApi.getJobs(filters).then(r => r.data.data),
    staleTime: 1000 * 60 * 2,  // 2 minutes — don't refetch if fresh
    placeholderData: prev => prev, // keep previous data while fetching new
    // 🔖 placeholderData prevents flash of empty screen
    // when user changes filters — shows old data until new arrives
  })
}

// ── Get single job ──
export function useJob(id) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn:  () => jobApi.getJobById(id).then(r => r.data.data),
    enabled:  !!id,   // don't fetch if id is null/undefined
    staleTime: 1000 * 60 * 5,
  })
}

// ── Admin: get own jobs ──
export function useMyJobs(filters = {}) {
  return useQuery({
    queryKey: jobKeys.my(filters),
    queryFn:  () => jobApi.getMyJobs(filters).then(r => r.data.data),
    staleTime: 1000 * 30,
  })
}

// ── Create job mutation ──
export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: jobApi.createJob,
    onSuccess: () => {
      // Invalidate cache → triggers background refetch
      queryClient.invalidateQueries({ queryKey: jobKeys.all() })
      toast.success('Job posted successfully!')
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Failed to create job')
    }
  })
}

// ── Update job mutation ──
export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => jobApi.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      toast.success('Job updated successfully!')
    },
    onError: err => toast.error(err.response?.data?.message || 'Update failed')
  })
}

// ── Delete job mutation ──
export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: jobApi.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all() })
      toast.success('Job deleted')
    },
    onError: () => toast.error('Delete failed')
  })
}