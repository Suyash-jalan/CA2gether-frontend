import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';
import { forumService } from '../services/forumService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import IconButton from '../components/ui/IconButton';
import PageTransition from '../components/layout/PageTransition';
import { FORUM_TAGS } from '../constants/forumTags';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [otherTag, setOtherTag] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    try {
      if (selectedTags.includes('Other') && !otherTag.trim()) {
        toast.error('Enter a topic name for Other', { className: 'toast-error' });
        setLoading(false);
        return;
      }
      const tagList = selectedTags.includes('Other')
        ? [...selectedTags, otherTag.trim()]
        : selectedTags;
      await forumService.createPost({ title: title.trim(), body: body.trim(), tags: tagList });
      toast.success('Post created!', { className: 'toast-success' });
      navigate('/lounge');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post', { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((current) => (
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    ));
    if (tag === 'Other' && selectedTags.includes('Other')) setOtherTag('');
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
          <fieldset>
            <legend className="text-xs font-semibold text-heading/85 mb-2">Topics</legend>
            <p className="text-xs text-muted mb-3">Choose every topic that applies to your discussion.</p>
            <div className="flex flex-wrap gap-2">
              {FORUM_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleTag(tag)}
                    className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-border bg-background text-muted hover:border-primary/50 hover:text-heading'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {selectedTags.includes('Other') && (
              <Input
                id="other-topic"
                label="Other topic"
                value={otherTag}
                onChange={(e) => setOtherTag(e.target.value)}
                placeholder="Enter your topic"
                maxLength={40}
                className="mt-4"
                required
              />
            )}
          </fieldset>
          <Button type="submit" fullWidth loading={loading}>Publish Post</Button>
        </form>
      </div>
    </PageTransition>
  );
}
