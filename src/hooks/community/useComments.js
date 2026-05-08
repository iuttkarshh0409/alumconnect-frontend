import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export const useComments = (postId) => {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await api.get(`/api/community/posts/${postId}/comments/`);
      return response.data;
    },
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content) => api.post(`/api/community/posts/${postId}/comments/`, { content }),
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData(['comments', postId]);

      queryClient.setQueryData(['comments', postId], old => [
        {
          id: 'temp-' + Date.now(),
          content: newContent,
          author_name: 'You',
          created_at: new Date().toISOString(),
          isOptimistic: true
        },
        ...(old || [])
      ]);

      return { previousComments };
    },
    onError: (err, newComment, context) => {
      queryClient.setQueryData(['comments', postId], context.previousComments);
      toast.error('Failed to add comment');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onSuccess: () => {
      toast.success('Comment added!');
    },
  });

  return {
    comments: comments || [],
    isLoading,
    addComment: addCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
  };
};
