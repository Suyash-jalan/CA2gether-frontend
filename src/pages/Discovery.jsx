import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
  HiHeart,
  HiXMark,
  HiAdjustmentsHorizontal,
  HiAcademicCap,
  HiSparkles,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { matchService } from '../services/matchService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FilterChip from '../components/ui/FilterChip';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import PageTransition from '../components/layout/PageTransition';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '../utils/media';
import { useAuth } from '../hooks/useAuth';

const CA_STATUSES = ['CA Foundation', 'CA Inter', 'CA Final', 'Articleship', 'Qualified CA'];
const FIRM_TYPES = ['Big 4', 'Mid-size', 'Independent', 'Industry'];
const SPECIALIZATIONS = ['Audit', 'Tax', 'GST', 'Valuation', 'CFO Track', 'Other'];

function SwipeCard({ user, onSwipe, onViewProfile, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('like');
    else if (info.offset.x < -100) onSwipe('pass');
  };

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? 'z-10 cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={isTop ? { x, rotate } : {}}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={isTop ? { scale: 1, y: 0 } : { scale: 0.95, y: 14 }}
      animate={isTop ? { scale: 1, y: 0 } : { scale: 0.95, y: 14 }}
      exit={{ x: 320, opacity: 0, transition: { duration: 0.25 } }}
    >
      <div className="bg-surface rounded-[24px] overflow-hidden h-full border border-border shadow-[0_8px_30px_rgba(217,105,74,0.12)] flex flex-col relative select-none">
        {/* Photo Container */}
        <div className="h-[58%] bg-border/40 relative overflow-hidden shrink-0">
          {user.photos?.[0] ? (
            <img
              src={resolveMediaUrl(user.photos[0])}
              alt={user.name}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 text-muted">
              <span className="text-6xl font-serif font-bold text-primary/40">
                {user.name?.[0] || 'CA'}
              </span>
            </div>
          )}

          {/* Verification badge floating top-right on photo */}
          {user.verificationStatus === 'verified' && (
            <div className="absolute top-4 right-4 z-10 shadow-sm">
              <Badge status="verified" text="ICAI Verified" />
            </div>
          )}

          {/* Swipe stamps */}
          {isTop && (
            <>
              <motion.div
                className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none"
                style={{ opacity: likeOpacity }}
              >
                <span className="text-4xl sm:text-5xl font-serif font-bold text-primary border-4 border-primary rounded-2xl px-6 py-2 rotate-[-12deg] bg-surface/80 backdrop-blur-sm">
                  LIKE
                </span>
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-pass/20 flex items-center justify-center pointer-events-none"
                style={{ opacity: passOpacity }}
              >
                <span className="text-4xl sm:text-5xl font-serif font-bold text-pass border-4 border-pass rounded-2xl px-6 py-2 rotate-[12deg] bg-surface/80 backdrop-blur-sm">
                  PASS
                </span>
              </motion.div>
            </>
          )}
        </div>

        {/* Info Container */}
        <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-heading truncate">
                {user.name}
              </h2>
              {user.age && (
                <span className="text-muted text-lg font-normal">, {user.age}</span>
              )}
            </div>

            {user.city && (
              <p className="text-muted text-sm mt-0.5 flex items-center gap-1">
                <span>📍</span> {user.city}
                {user.firmName && <span> • {user.firmName}</span>}
              </p>
            )}

            {/* Stage & Specialization Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.caStatus && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                  {user.caStatus}
                </span>
              )}
              {user.specialization && (
                <span className="px-3 py-1 bg-secondary/15 text-heading text-xs font-medium rounded-full border border-border">
                  {user.specialization}
                </span>
              )}
              {user.workLifeTag && (
                <span className="px-3 py-1 bg-success/15 text-success text-xs font-medium rounded-full">
                  {user.workLifeTag}
                </span>
              )}
            </div>

            {user.bio && (
              <p className="text-muted text-sm mt-3 leading-relaxed line-clamp-3">
                {user.bio}
              </p>
            )}
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onViewProfile(); }}
              className="mt-4 min-h-11 rounded-full border border-primary/30 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              View full profile
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Discovery() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [examBuddyMode, setExamBuddyMode] = useState(null);
  const [matchModal, setMatchModal] = useState(false);
  const [filters, setFilters] = useState({ city: '', caStatus: '', firmType: '', specialization: '' });
  const [page, setPage] = useState(1);
  const pendingSwipeIds = useRef(new Set());

  const activeExamBuddyMode = examBuddyMode ?? profile?.examBuddyMode ?? false;

  const fetchUsers = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const params = { page, limit: 20, examBuddyMode: String(activeExamBuddyMode) };
      if (filters.city) params.city = filters.city;
      if (filters.caStatus) params.caStatus = filters.caStatus;
      if (filters.firmType) params.firmType = filters.firmType;
      if (filters.specialization) params.specialization = filters.specialization;
      const { data } = await matchService.discover(params);
      setUsers((data.data || []).filter((user) => !pendingSwipeIds.current.has(user._id)));
    } catch {
      toast.error('Failed to load profiles', { className: 'toast-error' });
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [page, filters, activeExamBuddyMode]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSwipe = async (action) => {
    if (users.length === 0) return;
    const target = users[0];
    if (pendingSwipeIds.current.has(target._id)) return;

    const remainingUsers = users.slice(1);
    pendingSwipeIds.current.add(target._id);

    // Advance the deck immediately instead of waiting for the network round trip.
    setUsers((prev) => prev.filter((item) => item._id !== target._id));
    try {
      const { data } = await matchService.swipe({
        targetUserId: target._id,
        action,
        mode: activeExamBuddyMode ? 'exam_buddy' : 'dating',
      });
      if (data.matched) setMatchModal(true);

      // Refill quietly before the user reaches the end of the current deck.
      if (remainingUsers.length <= 3) await fetchUsers({ showLoader: false });
    } catch {
      // Restore the card when the server could not save the action.
      setUsers((prev) => (
        prev.some((item) => item._id === target._id) ? prev : [target, ...prev]
      ));
      toast.error('Swipe action failed', { className: 'toast-error' });
    } finally {
      pendingSwipeIds.current.delete(target._id);
    }
  };

  const toggleFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: prev[field] === value ? '' : value }));
    setPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.city || filters.caStatus || filters.firmType || filters.specialization);
  }, [filters]);

  const clearFilters = () => {
    setFilters({ city: '', caStatus: '', firmType: '', specialization: '' });
    setPage(1);
  };

  const modeTabs = [
    { key: 'dating', label: 'Dating', icon: HiSparkles },
    { key: 'exam_buddy', label: 'Exam Buddy', icon: HiAcademicCap },
  ];

  return (
    <PageTransition className="page-container flex flex-col items-center">
      <div className="w-full max-w-[500px] flex flex-col">
        {/* Top Control Bar: Tabs on left, Filter button on far right of same row */}
        <div className="flex items-center justify-between gap-3 mb-4 w-full">
          <SegmentedTabs
            tabs={modeTabs}
            activeTab={activeExamBuddyMode ? 'exam_buddy' : 'dating'}
            onChange={(key) => setExamBuddyMode(key === 'exam_buddy')}
          />

          <motion.button
            type="button"
            title="Filter profiles"
            aria-label="Filter profiles"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-primary text-white border-primary shadow-[0_2px_8px_rgba(217,105,74,0.3)]'
                : 'bg-surface text-muted hover:text-heading border-border hover:border-primary/40'
            }`}
          >
            <HiAdjustmentsHorizontal size={20} />
          </motion.button>
        </div>

        {/* Collapsible Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-5 w-full"
            >
              <div className="bg-surface rounded-2xl p-5 border border-border shadow-warm-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-semibold text-sm text-heading">Filter Profiles</h4>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline cursor-pointer font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* City Input */}
                <div>
                  <label htmlFor="filter-city" className="text-xs text-muted mb-1.5 block font-medium">
                    City
                  </label>
                  <input
                    id="filter-city"
                    placeholder="Search by city (e.g. Mumbai, Delhi)..."
                    value={filters.city}
                    onChange={(e) => {
                      setFilters({ ...filters, city: e.target.value });
                      setPage(1);
                    }}
                    className="text-sm px-3.5 py-2"
                  />
                </div>

                {/* CA Status */}
                <div>
                  <p className="text-xs text-muted mb-1.5 font-medium">CA Stage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CA_STATUSES.map((s, i) => (
                      <FilterChip
                        key={s}
                        label={s}
                        index={i}
                        selected={filters.caStatus === s}
                        onClick={() => toggleFilter('caStatus', s)}
                      />
                    ))}
                  </div>
                </div>

                {/* Firm Type */}
                <div>
                  <p className="text-xs text-muted mb-1.5 font-medium">Firm Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FIRM_TYPES.map((f, i) => (
                      <FilterChip
                        key={f}
                        label={f}
                        index={i}
                        selected={filters.firmType === f}
                        onClick={() => toggleFilter('firmType', f)}
                      />
                    ))}
                  </div>
                </div>

                {/* Specialization */}
                <div>
                  <p className="text-xs text-muted mb-1.5 font-medium">Specialization</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SPECIALIZATIONS.map((sp, i) => (
                      <FilterChip
                        key={sp}
                        label={sp}
                        index={i}
                        selected={filters.specialization === sp}
                        onClick={() => toggleFilter('specialization', sp)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Deck Area */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-full h-[520px] rounded-[24px] overflow-hidden">
              <SkeletonLoader type="card" count={1} className="h-full w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="w-full min-h-[460px] flex items-center justify-center bg-surface/40 rounded-[24px] border border-dashed border-border/80 p-6">
              <EmptyState
                icon={HiSparkles}
                title="No more profiles"
                subtitle="You've seen all available CAs matching your criteria. Check back later or adjust your filters."
                actionText="Adjust Filters"
                onAction={() => setShowFilters(true)}
                secondaryActionText="Refresh"
                onSecondaryAction={() => {
                  clearFilters();
                  fetchUsers();
                }}
              />
            </div>
          ) : (
            <div className="relative w-full h-[520px]">
              <AnimatePresence>
                {users.slice(0, 2).map((user, i) => (
                  <SwipeCard
                    key={user._id}
                    user={user}
                    isTop={i === 0}
                    onSwipe={handleSwipe}
                    onViewProfile={() => navigate(`/profile/${user._id}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Action buttons (Pass / Super-Like / Like) */}
          {!loading && users.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-5 mb-4 w-full">
              {/* Pass Button */}
              <motion.button
                type="button"
                aria-label="Pass profile"
                title="Pass"
                onClick={() => handleSwipe('pass')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface font-semibold text-muted shadow-sm hover:bg-background focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <HiXMark size={22} /> <span>Pass</span>
              </motion.button>

              {/* Like Button */}
              <motion.button
                type="button"
                aria-label="Like profile"
                title="Like"
                onClick={() => handleSwipe('like')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-white shadow-sm hover:brightness-95 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                <HiHeart size={22} /> <span>Like profile</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Match modal */}
      <AnimatePresence>
        {matchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-heading/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMatchModal(false)}
            />
            <motion.div
              className="relative bg-surface rounded-[24px] p-8 max-w-sm w-full text-center z-10 shadow-warm-lg border border-border"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🎉
              </motion.div>
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">It's a Match!</h2>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                You both expressed interest in connecting. Send a message to start the conversation!
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setMatchModal(false)} variant="outline">
                  Keep Browsing
                </Button>
                <Button onClick={() => { setMatchModal(false); window.location.href = '/matches'; }}>
                  Send Message
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
