import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../api/jobApi'
import toast from 'react-hot-toast'

export const appKeys = {
  my:     filters => ['myApplications', filters],
  forJob: jobId   => ['jobApplications', jobId],
}

export function useMyApplications(filters = {}) {
  return useQuery({
    queryKey: appKeys.my(filters),
    queryFn:  () => jobApi.getMyApplications(filters).then(r => r.data.data),
    staleTime: 1000 * 30,
  })
}

export function useJobApplications(jobId) {
  return useQuery({
    queryKey: appKeys.forJob(jobId),
    queryFn:  () => jobApi.getJobApplications(jobId).then(r => r.data.data),
    enabled:  !!jobId,
    staleTime: 1000 * 30,
  })
}

export function useApplyToJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, formData }) => jobApi.applyToJob(jobId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplications'] })
      toast.success('Application submitted! 🎉')
    },
    onError: err => {
      toast.error(err.response?.data?.message || 'Application failed')
    }
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) =>
      jobApi.updateApplicationStatus(id, { status }),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: appKeys.forJob(jobId) })
      toast.success('Status updated!')
    },
    onError: () => toast.error('Status update failed')
  })
}

export function useAnalyseResume() {
  return useMutation({
    mutationFn: jobApi.analyseResume,
    onSuccess: () => toast.success('AI analysis complete!'),
    onError:   () => toast.error('AI analysis failed')
  })
}