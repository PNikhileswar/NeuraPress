'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/lib/utils';

interface Comment {
  _id: string;
  content: string;
  userName: string;
  userImage?: string;
  createdAt: string;
  replies: Comment[];
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!session || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          content: replyContent.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-500">
                  Signed in as {session.user?.name}
                </p>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">Please sign in to post a comment.</p>
          <button
            onClick={() => {/* You can implement sign in logic here */}}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={(commentId) => setReplyTo(commentId)}
              replyTo={replyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              submitting={submitting}
              session={session}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  onReply,
  replyTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  submitting,
  session,
}: {
  comment: Comment;
  onReply: (id: string) => void;
  replyTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (e: React.FormEvent, parentId: string) => void;
  submitting: boolean;
  session: any;
}) {
  return (
    <div className="flex space-x-3">
      {comment.userImage ? (
        <img
          src={comment.userImage}
          alt={comment.userName}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {comment.userName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">{comment.userName}</span>
            <span className="text-sm text-gray-500">
              {formatDate(new Date(comment.createdAt))}
            </span>
          </div>
          <p className="text-gray-800">{comment.content}</p>
        </div>

        <div className="flex items-center space-x-4 mt-2">
          {session && (
            <button
              onClick={() => onReply(comment._id)}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Reply
            </button>
          )}
        </div>

        {/* Reply Form */}
        {replyTo === comment._id && (
          <form
            onSubmit={(e) => onSubmitReply(e, comment._id)}
            className="mt-4 ml-4"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={submitting}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => onReply('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim() || submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onReply={onReply}
                replyTo={replyTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onSubmitReply={onSubmitReply}
                submitting={submitting}
                session={session}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
