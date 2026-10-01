import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';
import { forumService } from '../services/forumService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import IconButton from '../components/ui/IconButton';
import PageTransition from '../components/layout/PageTransition';

export default function CreateEvent() {
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setLoading(true);
    try {
      await forumService.createEvent(form);
      toast.success('Event created!', { className: 'toast-success' });
      navigate('/lounge');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event', { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="page-container">
      <div className="page-container-feed">
        <div className="flex items-center gap-3 mb-6">
          <IconButton icon={HiArrowLeft} onClick={() => navigate('/lounge')} label="Back to Lounge" />
          <h1 className="font-serif text-2xl font-bold text-heading">Host Community Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-warm-sm space-y-5">
          <Input label="Event Title" value={form.title} onChange={set('title')} placeholder="e.g. CA Meet-up Mumbai / DT Study Session" maxLength={200} required />
          <Input label="Date & Time" type="datetime-local" value={form.date} onChange={set('date')} required />
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="Venue name, city or Google Meet link" />
          <div>
            <label className="text-sm font-medium text-heading">Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Event agenda, topics, or what to bring…" maxLength={5000} rows={4} className="mt-1.5" />
          </div>
          <Button type="submit" fullWidth loading={loading}>Create Event</Button>
        </form>
      </div>
    </PageTransition>
  );
}
