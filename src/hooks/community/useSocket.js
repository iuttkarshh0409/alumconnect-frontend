import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

export const useSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: '/socket.io', // Explicitly set path
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('feed_update', (newPost) => {
      queryClient.invalidateQueries(['feed']);
      toast('New community post!', { icon: '✨' });
    });

    socket.on('post_liked', (data) => {
      queryClient.invalidateQueries(['feed']);
    });

    socket.on('new_comment', (comment) => {
      queryClient.invalidateQueries(['comments', comment.post_id]);
      queryClient.invalidateQueries(['feed']);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
};
