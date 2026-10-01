import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiPlus,
  HiChatBubbleLeftEllipsis,
  HiCalendarDays,
  HiHashtag,
  HiMagnifyingGlass,
  HiClock,
  HiMapPin,
  HiCheckCircle,
  HiChatBubbleOvalLeft,
} from 'react-icons/hi2';
import { forumService } from '../services/forumService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import PageTransition from '../components/layout/PageTransition';
import ScrollToTop from '../components/ui/ScrollToTop';

const TABS = [
  { key: 'all', label: 'All Discussions', icon: HiChatBubbleLeftEllipsis },
  { key: 'events', label: 'Community Events', icon: HiCalendarDays },
];

const POPULAR_TAGS = ['All', 'Audit', 'Tax', 'DirectTax', 'Big4', 'Articleship', 'Valuation', 'WorkLife', 'ExamBuddy'];

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now - d;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Lounge() {
  const [tab, setTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'all') {
          const params = {};
          if (selectedTag && selectedTag !== 'All') {
            params.tag = selectedTag;
          }
          const { data } = await forumService.getPosts(params);
          setPosts(data.data || []);
        } else {
          const { data } = await forumService.getEvents();
          setEvents(data.data || []);
        }
      } catch {
        toast.error('Failed to load content', { className: 'toast-error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, selectedTag]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.body?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const handleRsvp = async (eventId, e) => {
    e.stopPropagation();
    try {
      const { data } = await forumService.toggleRsvp(eventId);
      setEvents((current) => current.map((event) => event._id === eventId ? { ...event, isAttending: data.isAttending, attendeeCount: data.attendeeCount } : event));
      if (data.isAttending) {
        toast.success("RSVP confirmed! We'll remind you before the event.", {
          className: 'toast-success',
        });
      } else {
        toast('RSVP removed', { icon: 'ℹ️' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update your RSVP');
    }
  };

  return (
    <PageTransition className="page-container">
      <div className="page-container-feed">
        {/* Header with Title and New Post CTA aligned on baseline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-heading">CA Lounge</h1>
            <p className="text-muted text-sm mt-1">
              Connect over articleship stories, exam strategies, and meetups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="md"
              variant="primary"
              onClick={() =>
                navigate(tab === 'events' ? '/lounge/create-event' : '/lounge/create-post')
              }
              className="shadow-warm-sm"
            >
              <HiPlus size={18} className="mr-1.5 inline" />
              {tab === 'events' ? 'Host Event' : 'New Post'}
            </Button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between mb-6">
          <SegmentedTabs
            tabs={TABS}
            activeTab={tab}
            onChange={(k) => {
              setTab(k);
              setSearchQuery('');
            }}
          />
        </div>

        {/* Posts Tab Controls: Full-width search input & Clickable Tags */}
        {tab === 'all' && (
          <div className="space-y-3 mb-6">
            {/* Search Input (44px height, leading icon, clear placeholder) */}
            <div className="relative">
              <HiMagnifyingGlass
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search discussions or keywords (e.g. Audit, Nov 2026, CFA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full text-sm border border-border bg-surface shadow-xs focus:bg-surface"
              />
            </div>

            {/* Popular Clickable Tag Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-muted font-medium flex items-center gap-0.5 shrink-0 pr-1">
                <HiHashtag size={14} /> Topics:
              </span>
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`
                      shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer border
                      ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface text-muted hover:text-heading border-border hover:border-primary/40'
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : tab === 'all' ? (
          filteredPosts.length === 0 ? (
            <div className="bg-surface/50 rounded-3xl border border-dashed border-border/80 p-8 sm:p-12 my-6">
              <EmptyState
                icon={HiChatBubbleLeftEllipsis}
                title="No discussions found"
                subtitle={
                  searchQuery || selectedTag !== 'All'
                    ? 'No posts matched your search filters. Try clearing tags or search terms.'
                    : 'Be the first to start a conversation in the CA Lounge!'
                }
                actionText="Create New Post"
                onAction={() => navigate('/lounge/create-post')}
                secondaryActionText={searchQuery || selectedTag !== 'All' ? 'Reset Filters' : undefined}
                onSecondaryAction={
                  searchQuery || selectedTag !== 'All'
                    ? () => {
                        setSearchQuery('');
                        setSelectedTag('All');
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Card
                    hover
                    onClick={() => navigate(`/posts/${post._id}`)}
                    className="p-5 cursor-pointer rounded-2xl border border-border shadow-warm-sm hover:shadow-warm transition-all group"
                  >
                    <h2 className="font-serif text-xl font-bold text-heading group-hover:text-primary transition-colors mb-2 leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed">
                      {post.body}
                    </p>

                    {/* Card Footer Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                      {/* Author & Tag Chips */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-serif font-bold">
                            {post.author?.name?.[0] || 'CA'}
                          </div>
                          <span className="text-xs font-medium text-heading">
                            {post.author?.name || 'Anonymous CA'}
                          </span>
                        </div>

                        {post.tags?.map((t) => (
                          <span
                            key={t}
                            className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary/15 text-heading border border-border"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Date & Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <HiClock size={13} /> {formatDate(post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 hover:text-primary">
                          <HiChatBubbleOvalLeft size={14} /> Discuss
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* Events List Tab */
          events.length === 0 ? (
            <div className="bg-surface/50 rounded-3xl border border-dashed border-border/80 p-8 sm:p-12 my-6">
              <EmptyState
                icon={HiCalendarDays}
                title="No upcoming events"
                subtitle="There are no community meetups scheduled yet. Why not organize a coffee meetup or study session?"
                actionText="Host an Event"
                onAction={() => navigate('/lounge/create-event')}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, i) => {
                const eventDate = new Date(event.date);
                const isRsvpd = event.isAttending;

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Card className="p-5 rounded-2xl border border-border shadow-warm-sm">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Date Banner Box */}
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0 shadow-xs">
                          <span className="text-[11px] font-bold text-primary tracking-wider uppercase">
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-serif font-extrabold text-primary leading-none mt-0.5">
                            {eventDate.getDate()}
                          </span>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-bold text-heading mb-1 leading-snug">
                            {event.title}
                          </h3>

                          {event.location && (
                            <p className="text-xs text-muted flex items-center gap-1 mb-2 font-medium">
                              <HiMapPin size={14} className="text-primary shrink-0" />
                              {event.location}
                            </p>
                          )}

                          {event.description && (
                            <p className="text-sm text-muted leading-relaxed line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <p className="mt-2 text-xs font-medium text-muted">{event.attendeeCount || 0} attending</p>
                        </div>

                        {/* RSVP Action */}
                        <div className="mt-3 sm:mt-0 shrink-0">
                          <Button
                            size="sm"
                            variant={isRsvpd ? 'secondary' : 'primary'}
                            onClick={(e) => handleRsvp(event._id, e)}
                            className="w-full sm:w-auto"
                          >
                            {isRsvpd ? (
                              <>
                                <HiCheckCircle size={16} className="mr-1 inline text-success" />
                                Going
                              </>
                            ) : (
                              'RSVP'
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>
      <ScrollToTop />
    </PageTransition>
  );
}
