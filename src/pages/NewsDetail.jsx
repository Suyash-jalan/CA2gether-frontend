import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowTopRightOnSquare } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { newsService } from '../services/newsService';
import IconButton from '../components/ui/IconButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageTransition from '../components/layout/PageTransition';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { newsService.get(id).then(({ data }) => setItem(data.data)).catch(() => { toast.error('News article not found'); navigate('/news', { replace: true }); }).finally(() => setLoading(false)); }, [id, navigate]);
  if (loading) return <div className="page-container"><div className="page-container-feed"><SkeletonLoader type="card" count={2} /></div></div>;
  if (!item) return null;
  return <PageTransition className="page-container"><article className="page-container-feed">
    <div className="mb-5 flex items-center gap-3"><IconButton icon={HiArrowLeft} onClick={() => navigate('/news')} label="Back to news" /><span className="text-sm font-semibold text-heading">Back to news</span></div>
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-warm-sm">
      {item.coverImageUrl && <img src={item.coverImageUrl} alt="" className="max-h-[440px] w-full object-cover" />}
      <div className="p-6 sm:p-9"><div className="mb-4 flex flex-wrap items-center gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{item.category}</span><span className="text-xs text-muted">{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span></div>
        <h1 className="font-serif text-3xl font-bold leading-tight text-heading sm:text-4xl">{item.title}</h1><p className="mt-4 text-base font-medium leading-7 text-muted">{item.summary}</p>
        <div className="mt-7 whitespace-pre-wrap border-t border-border pt-7 text-sm leading-8 text-heading">{item.content}</div>
        {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">View original source <HiArrowTopRightOnSquare /></a>}
      </div>
    </div>
  </article></PageTransition>;
}
