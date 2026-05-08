import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const response = await api.get('/api/community/posts/', {
        params: {
          cursor: pageParam,
          limit: 10,
        },
      });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  });
};
