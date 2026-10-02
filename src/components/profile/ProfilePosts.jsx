import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiCamera,
  HiChatBubbleOvalLeft,
  HiHeart,
  HiOutlineHeart,
  HiPaperAirplane,
  HiPlus,
  HiTrash,
  HiXMark,
} from 'react-icons/hi2';
import { forumService } from '../../services/forumService';
import { resolveMediaUrl } from '../../utils/media';
import Button from '../ui/Button';
import { compressImage } from '../../utils/imageCompression';

function Avatar({ user }) {
  return user?.photos?.[0] ? (
    <img src={resolveMediaUrl(user.photos[0])} alt="" className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif font-bold text-primary">
      {user?.name?.[0] || 'CA'}
    </div>
  );
}

export default function ProfilePosts({ userId, canCreate = false, initialPostId = '' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef(null);
  const openedInitialPostRef = useRef('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    forumService.getProfilePosts(userId)
      .then(({ data }) => { if (active) setPosts(data.data || []); })
      .catch(() => { if (active) toast.error('Could not load photo posts'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseImage = async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }
    setCompressing(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 1920, quality: 0.84 });
      if (preview) URL.revokeObjectURL(preview);
      setImage(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (error) {
      toast.error(error.message || 'Could not process this image');
    } finally {
      setCompressing(false);
    }
  };

  const resetComposer = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview('');
    setCaption('');
    setComposerOpen(false);
  };

  const publish = async (event) => {
    event.preventDefault();
    if (!image) return toast.error('Choose an image first');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption.trim());
    setSubmitting(true);
    try {
      const { data } = await forumService.createProfilePost(formData);
      setPosts((current) => [data.data, ...current]);
      resetComposer();
      toast.success('Photo shared');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not share photo');
    } finally {
      setSubmitting(false);
    }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    setComments([]);
    try {
      const { data } = await forumService.getComments(post._id);
      setComments(data.data || []);
    } catch {
      toast.error('Could not load comments');
    }
  };

  useEffect(() => {
    if (!initialPostId || loading || openedInitialPostRef.current === initialPostId) return;
    const post = posts.find((item) => item._id === initialPostId);
    if (!post) return;

    openedInitialPostRef.current = initialPostId;
    setSelectedPost(post);
    setComments([]);
    forumService.getComments(post._id)
      .then(({ data }) => setComments(data.data || []))
      .catch(() => toast.error('Could not load comments'));
  }, [initialPostId, loading, posts]);

  const toggleLike = async (postId) => {
    try {
      const { data } = await forumService.togglePostLike(postId);
      const update = (post) => post._id === postId
        ? { ...post, isLiked: data.isLiked, likeCount: data.likeCount }
        : post;
      setPosts((current) => current.map(update));
      setSelectedPost((current) => current ? update(current) : current);
    } catch {
      toast.error('Could not update like');
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim() || !selectedPost) return;
    setSubmitting(true);
    try {
      const { data } = await forumService.createComment(selectedPost._id, { body: comment.trim() });
      setComments((current) => [...current, data.data]);
      setPosts((current) => current.map((post) => post._id === selectedPost._id
        ? { ...post, commentCount: (post.commentCount || 0) + 1 }
        : post));
      setSelectedPost((current) => ({ ...current, commentCount: (current.commentCount || 0) + 1 }));
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async () => {
    if (!selectedPost) return;
    try {
      await forumService.deletePost(selectedPost._id);
      setPosts((current) => current.filter((post) => post._id !== selectedPost._id));
      setSelectedPost(null);
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post');
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-warm-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-heading">Posts</h2>
          <p className="mt-0.5 text-xs text-muted">Photos, moments, and life beyond the ledger.</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setComposerOpen(true)}>
            <HiPlus size={17} /> New post
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[0, 1, 2].map((item) => <div key={item} className="aspect-square animate-pulse rounded-xl bg-background" />)}
        </div>
      ) : posts.length ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {posts.map((post) => (
            <button key={post._id} type="button" onClick={() => openPost(post)} className="group relative aspect-square overflow-hidden rounded-xl bg-background focus-visible:outline-2 focus-visible:outline-primary">
              <img src={resolveMediaUrl(post.imageUrl)} alt={post.body || 'Profile post'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center gap-4 bg-heading/55 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100">
                <span className="flex items-center gap-1"><HiHeart size={19} /> {post.likeCount || 0}</span>
                <span className="flex items-center gap-1"><HiChatBubbleOvalLeft size={19} /> {post.commentCount || 0}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-4 text-center">
          <HiCamera size={28} className="mb-2 text-primary/60" />
          <p className="text-sm font-semibold text-heading">No photo posts yet</p>
          <p className="mt-1 text-xs text-muted">{canCreate ? 'Share your first moment with the community.' : 'New posts will appear here.'}</p>
        </div>
      )}

      <AnimatePresence>
        {composerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) resetComposer(); }}>
            <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onSubmit={publish} className="w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between"><h3 className="font-serif text-xl font-bold">Create photo post</h3><button type="button" onClick={resetComposer} className="rounded-full p-2 hover:bg-background" aria-label="Close"><HiXMark size={20} /></button></div>
              <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-square max-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background">
                {preview ? <img src={preview} alt="Post preview" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center text-sm font-semibold text-primary"><HiCamera size={32} className="mb-2" />{compressing ? 'Optimizing image…' : 'Choose an image'}</span>}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseImage(event.target.files?.[0])} />
              <textarea value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={2000} rows={3} placeholder="Write a caption…" className="mt-4 w-full rounded-2xl" />
              <Button type="submit" fullWidth loading={submitting || compressing} disabled={!image || compressing} className="mt-4">Share post</Button>
            </motion.form>
          </div>
        )}

        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/70 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPost(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-surface shadow-2xl md:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
              <div className="flex min-h-72 items-center justify-center bg-black"><img src={resolveMediaUrl(selectedPost.imageUrl)} alt={selectedPost.body || 'Profile post'} className="max-h-[92vh] w-full object-contain" /></div>
              <div className="flex min-h-0 flex-col">
                <div className="flex items-center gap-3 border-b border-border p-4"><Avatar user={selectedPost.author} /><span className="flex-1 text-sm font-bold text-heading">{selectedPost.author?.name || 'CA member'}</span>{canCreate && <button type="button" onClick={deletePost} className="p-2 text-error" aria-label="Delete post"><HiTrash size={18} /></button>}<button type="button" onClick={() => setSelectedPost(null)} className="p-2" aria-label="Close"><HiXMark size={20} /></button></div>
                <div className="min-h-28 flex-1 overflow-y-auto p-4">
                  {selectedPost.body && <p className="mb-5 text-sm leading-6 text-heading"><strong className="mr-2">{selectedPost.author?.name}</strong>{selectedPost.body}</p>}
                  <div className="space-y-4">{comments.map((item) => <div key={item._id} className="flex gap-3"><Avatar user={item.author} /><p className="text-sm leading-5 text-heading"><strong className="mr-2">{item.author?.name || 'Member'}</strong>{item.body}</p></div>)}</div>
                </div>
                <div className="border-t border-border p-4">
                  <button type="button" onClick={() => toggleLike(selectedPost._id)} className={`mb-2 flex items-center gap-2 text-sm font-bold ${selectedPost.isLiked ? 'text-primary' : 'text-heading'}`}>{selectedPost.isLiked ? <HiHeart size={25} /> : <HiOutlineHeart size={25} />}{selectedPost.likeCount || 0} likes</button>
                  <form onSubmit={addComment} className="flex items-center gap-2"><input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} placeholder="Add a comment…" className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm" /><button type="submit" disabled={!comment.trim() || submitting} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40" aria-label="Post comment"><HiPaperAirplane size={17} /></button></form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
