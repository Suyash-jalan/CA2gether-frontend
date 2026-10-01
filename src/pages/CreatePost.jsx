import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';
import { forumService } from '../services/forumService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import IconButton from '../components/ui/IconButton';
import PageTransition from '../components/layout/PageTransition';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await forumService.createPost({ title: title.trim(), body: body.trim(), tags: tagList });
      toast.success('Post created!', { className: 'toast-success' });
      navigate('/lounge');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post', { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="page-container">
      <div className="page-container-feed">
        <div className="flex items-center gap-3 mb-6">
          <IconButton icon={HiArrowLeft} onClick={() => navigate('/lounge')} label="Back to Lounge" />
          <h1 className="font-serif text-2xl font-bold text-heading">Create Discussion Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-warm-sm space-y-5">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind? (e.g. Nov 2026 prep strategy)" maxLength={200} required />
          <div>
            <label className="text-sm font-medium text-heading">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience, query, or thoughts with fellow CAs…" maxLength={5000} rows={6} className="mt-1.5" required />
          </div>
          <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Audit, Big4, DirectTax, Articleship" />
          <Button type="submit" fullWidth loading={loading}>Publish Post</Button>
        </form>
      </div>
    </PageTransition>
  );
}
