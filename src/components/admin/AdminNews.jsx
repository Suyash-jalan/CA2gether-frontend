import { useEffect, useState } from 'react';
import { HiNewspaper, HiPencilSquare, HiPlus, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';

const blank = { title: '', summary: '', content: '', category: 'General', coverImageUrl: '', sourceUrl: '', status: 'draft' };

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => adminService.getNews().then(({ data }) => setItems(data.data || [])).catch(() => toast.error('Could not load news'));
  useEffect(() => { load(); }, []);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const close = () => { setOpen(false); setEditingId(''); setForm(blank); };
  const edit = (item) => { setEditingId(item._id); setForm({ title: item.title, summary: item.summary, content: item.content, category: item.category, coverImageUrl: item.coverImageUrl || '', sourceUrl: item.sourceUrl || '', status: item.status }); setOpen(true); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try { if (editingId) await adminService.updateNews(editingId, form); else await adminService.createNews(form); toast.success(form.status === 'published' ? 'News published' : 'Draft saved'); close(); load(); }
    catch (error) { toast.error(error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Could not save news'); }
    finally { setSaving(false); }
  };
  const remove = async (id) => { try { await adminService.deleteNews(id); setItems((current) => current.filter((item) => item._id !== id)); toast.success('News deleted'); } catch { toast.error('Could not delete news'); } };

  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h2 className="font-serif text-xl font-bold text-heading">News publishing</h2><p className="text-xs text-muted">Create drafts and publish official updates.</p></div><Button onClick={() => setOpen(true)}><HiPlus /> Add news</Button></div>
    {items.length === 0 ? <EmptyState icon={HiNewspaper} title="No news articles" description="Create the first official update for members." /> : <div className="space-y-3">{items.map((item) => <Card key={item._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.status === 'published' ? 'bg-success/10 text-success' : 'bg-border text-muted'}`}>{item.status}</span><span className="text-[11px] text-muted">{item.category}</span></div><h3 className="mt-2 truncate font-serif text-lg font-bold text-heading">{item.title}</h3><p className="mt-1 line-clamp-1 text-xs text-muted">{item.summary}</p></div><div className="flex shrink-0 gap-2"><Button size="sm" variant="outline" onClick={() => edit(item)}><HiPencilSquare /> Edit</Button><Button size="sm" variant="outline" className="text-error" onClick={() => remove(item._id)}><HiTrash /> Delete</Button></div></Card>)}</div>}
    <Modal isOpen={open} onClose={close} title={editingId ? 'Edit news article' : 'Create news article'}><form onSubmit={save} className="space-y-4">
      <div><label className="mb-1 block text-xs font-semibold">Title</label><input value={form.title} onChange={set('title')} maxLength={200} required className="w-full" /></div>
      <div><label className="mb-1 block text-xs font-semibold">Summary</label><textarea value={form.summary} onChange={set('summary')} maxLength={500} rows={2} required className="w-full" /></div>
      <div><label className="mb-1 block text-xs font-semibold">Full article</label><textarea value={form.content} onChange={set('content')} maxLength={20000} rows={8} required className="w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold">Category</label><select value={form.category} onChange={set('category')} className="w-full">{['ICAI', 'Exams', 'Tax & Compliance', 'Career', 'Community', 'General'].map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="mb-1 block text-xs font-semibold">Status</label><select value={form.status} onChange={set('status')} className="w-full"><option value="draft">Draft</option><option value="published">Published</option></select></div></div>
      <div><label className="mb-1 block text-xs font-semibold">Cover image URL <span className="font-normal text-muted">(optional)</span></label><input type="url" value={form.coverImageUrl} onChange={set('coverImageUrl')} placeholder="https://..." className="w-full" /></div>
      <div><label className="mb-1 block text-xs font-semibold">Source URL <span className="font-normal text-muted">(optional)</span></label><input type="url" value={form.sourceUrl} onChange={set('sourceUrl')} placeholder="https://..." className="w-full" /></div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" loading={saving}>{form.status === 'published' ? 'Publish' : 'Save draft'}</Button></div>
    </form></Modal>
  </div>;
}
