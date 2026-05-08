import React, { useEffect } from 'react';
import { useFeed } from '../../hooks/community/useFeed';
import PostCard from './PostCard';
import { RefreshCw, AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import PostSkeleton from './PostSkeleton';

const Feed = () => {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt
  } = useFeed();

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 500
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <div className={clsx("w-2 h-2 rounded-full", isFetching ? "bg-blue-500 animate-pulse" : "bg-green-500")} />
          <span>{dataUpdatedAt ? `Last updated: ${new Date(dataUpdatedAt).toLocaleTimeString()}` : 'Initializing feed...'}</span>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors px-2 py-1 rounded-md hover:bg-blue-50 disabled:opacity-50"
        >
          <RefreshCw className={clsx("w-3 h-3", isFetching ? "animate-spin" : "")} />
          <span>{isFetching ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-rose-900 mb-2">Failed to load feed</h3>
          <p className="text-rose-700 text-sm mb-4">{error?.message || 'There was an issue connecting to the server.'}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {isLoading && !isError && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
        </div>
      )}

      <div className="space-y-6">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </React.Fragment>
        ))}
      </div>

      {!isLoading && !isError && data?.pages[0].posts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Inbox size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No posts yet</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            The community is quiet right now. Be the first to share an update!
          </p>
        </div>
      )}

      {isFetchingNextPage && (
        <div className="space-y-6">
          <PostSkeleton />
        </div>
      )}
      
      {!hasNextPage && data && data.pages[0].posts.length > 0 && (
        <div className="text-center py-10 text-slate-400 text-sm italic">
          You've reached the end of the community feed.
        </div>
      )}
    </div>
  );
};

export default Feed;
