import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiNewspaper, HiArrowRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { newsService } from '../services/newsService';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageTransition from '../components/layout/PageTransition';

const categories = ['All', 'ICAI', 'Exams', 'Tax & Compliance', 'Career', 'Community', 'General'];

export default function News() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    newsService.list(category === 'All' ? {} : { category })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => toast.error('Could not load news'))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <PageTransition className="page-container">
      <div className="page-container-feed space-y-6">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-3xl font-bold text-heading"><HiNewspaper className="text-primary" /> CA News</h1>
          <p className="mt-1 text-sm text-muted">Official updates selected by the CA2gether team.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${category === item ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-muted hover:text-heading'}`}>{item}</button>)}
        </div>
        {loading ? <SkeletonLoader type="card" count={4} /> : items.length === 0 ? (
          <EmptyState icon={HiNewspaper} title="No news published yet" description="Official CA2gether updates will appear here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item._id} hover onClick={() => navigate(`/news/${item._id}`)} className="cursor-pointer overflow-hidden p-0">
                {item.coverImageUrl && <img src={item.coverImageUrl} alt="" className="aspect-[16/8] w-full object-cover" />}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{item.category}</span><span className="text-[11px] text-muted">{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span></div>
                  <h2 className="font-serif text-xl font-bold leading-tight text-heading">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{item.summary}</p>
                  <span className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">Read article <HiArrowRight /></span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
