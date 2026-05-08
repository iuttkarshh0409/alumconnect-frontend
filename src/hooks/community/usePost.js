import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export const usePost = () => {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (content) => api.post('/api/community/posts/', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
      toast.success('Post shared successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create post');
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }) => {
      return isLiked 
        ? api.delete(`/api/community/posts/${postId}/like/`)
        : api.post(`/api/community/posts/${postId}/like/`);
    },
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData(['feed']);

      queryClient.setQueryData(['feed'], old => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            posts: page.posts.map(post => {
              if (post.id === postId) {
                return {
                  ...post,
                  has_liked: !isLiked,
                  likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
                };
              }
              return post;
            })
          }))
        };
      });

      return { previousFeed };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['feed'], context.previousFeed);
      toast.error('Something went wrong');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onSuccess: (_, variables) => {
      if (!variables.isLiked) {
        toast.success('Liked!');
      }
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: (postId) => api.post(`/api/community/posts/${postId}/flag/`),
    onSuccess: () => {
      toast.success('Post reported to moderators');
    },
    onError: () => {
      toast.error('Failed to report post');
    },
  });

  return {
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    toggleLike: likeMutation.mutate,
    isLiking: likeMutation.isPending,
    reportPost: reportPostMutation.mutate,
    isReporting: reportPostMutation.isPending,
  };
};
