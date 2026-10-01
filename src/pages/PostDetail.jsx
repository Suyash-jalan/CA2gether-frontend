import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPaperAirplane, HiTrash } from 'react-icons/hi2';
import { forumService } from '../services/forumService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import IconButton from '../components/ui/IconButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageTransition from '../components/layout/PageTransition';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          forumService.getPost(id),
          forumService.getComments(id),
        ]);
        setPost(postRes.data.data);
        setComments(commentsRes.data.data || []);
      } catch {
        toast.error('Post not found', { className: 'toast-error' });
        navigate('/lounge');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await forumService.createComment(id, { body: comment.trim() });
      setComments((prev) => [...prev, data.data]);
      setComment('');
      toast.success('Comment added', { className: 'toast-success' });
    } catch {
      toast.error('Failed to comment', { className: 'toast-error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await forumService.deletePost(id);
      toast.success('Post deleted', { className: 'toast-success' });
      navigate('/lounge');
    } catch {
      toast.error('Failed to delete', { className: 'toast-error' });
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="page-container-feed">
        <SkeletonLoader type="card" count={1} />
      </div>
    </div>
  );

  return (
    <PageTransition className="page-container">
      <div className="page-container-feed">
        <div className="flex items-center gap-3 mb-6">
        <IconButton icon={HiArrowLeft} onClick={() => navigate('/lounge')} label="Back" />
        <h1 className="font-serif text-xl font-semibold flex-1">Post</h1>
        {(post?.author?._id === user?.id || user?.role === 'admin') && (
          <IconButton icon={HiTrash} onClick={handleDeletePost} label="Delete" className="text-error hover:text-error" />
        )}
      </div>

      <Card hover={false} className="mb-6">
        <h2 className="font-serif text-xl font-bold mb-3">{post?.title}</h2>
        <p className="text-heading text-sm leading-relaxed whitespace-pre-wrap mb-4">{post?.body}</p>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>by {post?.author?.name || 'Anonymous'}</span>
          <span>·</span>
          <span>{new Date(post?.createdAt).toLocaleDateString()}</span>
          {post?.tags?.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-[999px]">{tag}</span>
          ))}
        </div>
      </Card>

      {/* Comments */}
      <h3 className="font-serif text-lg font-semibold mb-4">Comments ({comments.length})</h3>
      <div className="space-y-3 mb-6">
        {comments.map((c, i) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface rounded-[16px] p-4 border border-border"
          >
            <p className="text-sm text-heading mb-2">{c.body}</p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{c.author?.name || 'Anonymous'}</span>
              <span>·</span>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comment input */}
      <form onSubmit={handleComment} className="flex items-center gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 rounded-[999px] px-4 py-3 text-sm"
          maxLength={2000}
        />
        <motion.button
          type="submit"
          disabled={submitting || !comment.trim()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          <HiPaperAirplane size={18} />
        </motion.button>
      </form>
      </div>
    </PageTransition>
  );
}
