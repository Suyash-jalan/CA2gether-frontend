import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiHeart,
  HiChatBubbleLeftRight,
  HiXMark,
  HiAcademicCap,
  HiUserPlus,
  HiArrowUturnLeft,
} from 'react-icons/hi2';
import { matchService } from '../services/matchService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import PageTransition from '../components/layout/PageTransition';
import { resolveMediaUrl } from '../utils/media';
import { useSocket } from '../hooks/useSocket';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [incomingLikes, setIncomingLikes] = useState([]);
  const [passedProfiles, setPassedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likesRefresh, setLikesRefresh] = useState(0);
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [tab, setTab] = useState(requestedTab === 'passed' ? 'passed' : 'dating');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { connect } = useSocket();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        if (tab === 'likes') {
          const { data } = await matchService.getIncomingLikes({ mode: 'dating' });
          setIncomingLikes(data.data || []);
        } else if (tab === 'passed') {
          const [{ data }, likesResponse] = await Promise.all([
            matchService.getPassedProfiles(),
            matchService.getIncomingLikes({ mode: 'dating' }),
          ]);
          setPassedProfiles(data.data || []);
          setIncomingLikes(likesResponse.data.data || []);
        } else {
          const [{ data }, likesResponse] = await Promise.all([
            matchService.getMatches({ mode: tab }),
            matchService.getIncomingLikes({ mode: 'dating' }),
          ]);
          setMatches(data.data || []);
          setIncomingLikes(likesResponse.data.data || []);
        }
      } catch {
        toast.error('Failed to load matches', { className: 'toast-error' });
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [tab, likesRefresh]);

  useEffect(() => {
    const socket = connect();
    if (!socket) return;
    const handleIncomingLike = ({ mode } = {}) => {
      if (!mode || mode === 'dating') setLikesRefresh((value) => value + 1);
    };
    socket.on('incoming_like', handleIncomingLike);
    return () => socket.off('incoming_like', handleIncomingLike);
  }, [connect]);

  useEffect(() => {
    if (tab !== 'likes') return;
    const interval = setInterval(() => setLikesRefresh((value) => value + 1), 15000);
    return () => clearInterval(interval);
  }, [tab]);

  const handleUnmatch = async (e, matchId) => {
    e.stopPropagation();
    try {
      await matchService.unmatch(matchId);
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
      toast.success('Unmatched successfully', { className: 'toast-success' });
    } catch {
      toast.error('Failed to unmatch', { className: 'toast-error' });
    }
  };

  const handleRestoreProfile = async (entry) => {
    try {
      await matchService.restorePassedProfile(entry.user._id, entry.mode);
      setPassedProfiles((current) => current.filter((item) => item._id !== entry._id));
      toast.success('Profile will appear in Discover again', { className: 'toast-success' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not restore this profile', { className: 'toast-error' });
    }
  };

  const handleLikeRequest = async (request, action) => {
    try {
      const { data } = await matchService.swipe({
        targetUserId: request.user._id,
        action,
        mode: request.mode,
      });
      setIncomingLikes((prev) => prev.filter((item) => item._id !== request._id));
      if (data.matched) {
        toast.success(`You matched with ${request.user.name}!`, { className: 'toast-success' });
        setTab('dating');
      } else if (action === 'pass') {
        toast.success('Request declined', { className: 'toast-success' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update this request', { className: 'toast-error' });
    }
  };

  const getOtherUser = (match) => match.users?.find((u) => u._id !== user?.id) || {};

  const tabs = [
    { key: 'dating', label: 'Dating Matches', icon: HiHeart },
    { key: 'likes', label: 'Likes You', icon: HiUserPlus, badge: incomingLikes.length || undefined },
    { key: 'exam_buddy', label: 'Exam Buddies', icon: HiAcademicCap },
    { key: 'passed', label: 'Passed Profiles', icon: HiArrowUturnLeft },
  ];

  return (
    <PageTransition className="page-container">
      <div className="page-container-feed">
        {/* Header */}
        <div className="flex flex-col items-start gap-5 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-heading">Your Connections</h1>
            <p className="text-muted text-sm mt-1">
              Connect and chat with CAs who matched your energy.
            </p>
          </div>

          <SegmentedTabs
            tabs={tabs}
            activeTab={tab}
            onChange={setTab}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonLoader type="card" count={4} />
          </div>
        ) : tab === 'likes' ? (
          incomingLikes.length === 0 ? (
            <div className="bg-surface/50 rounded-3xl border border-dashed border-border/80 p-8 sm:p-12 my-6">
              <EmptyState
                icon={HiUserPlus}
                title="No new likes"
                subtitle="When someone likes your dating profile, their request will appear here."
                actionText="Explore Discover"
                onAction={() => navigate('/discover')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {incomingLikes.map((request) => {
                const person = request.user || {};
                return (
                  <Card key={request._id} className="p-5">
                    <div className="flex items-start gap-4">
                      <button type="button" onClick={() => navigate(`/profile/${person._id}`)} className="w-16 h-16 rounded-2xl bg-primary/10 overflow-hidden shrink-0">
                        {person.photos?.[0] ? <img src={resolveMediaUrl(person.photos[0])} alt={person.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-primary font-serif font-bold text-xl">{person.name?.[0] || 'CA'}</span>}
                      </button>
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => navigate(`/profile/${person._id}`)} className="font-serif font-bold text-lg text-heading hover:text-primary">{person.name || 'CA member'}</button>
                        <p className="text-sm text-muted">{[person.caStatus, person.city].filter(Boolean).join(' · ')}</p>
                        <p className="text-xs text-muted mt-1">Liked you {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <Button variant="secondary" onClick={() => handleLikeRequest(request, 'pass')}><HiXMark size={17} className="mr-1.5 inline" />Pass</Button>
                      <Button onClick={() => handleLikeRequest(request, 'like')}><HiHeart size={17} className="mr-1.5 inline" />Accept</Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : tab === 'passed' ? (
          passedProfiles.length === 0 ? (
            <div className="bg-surface/50 rounded-3xl border border-dashed border-border/80 p-8 sm:p-12 my-6">
              <EmptyState
                icon={HiArrowUturnLeft}
                title="No passed profiles"
                subtitle="Profiles you pass will appear here so you can reconsider them later."
                actionText="Explore Discover"
                onAction={() => navigate('/discover')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {passedProfiles.map((entry, i) => {
                const person = entry.user || {};
                return (
                  <motion.div key={entry._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-5 h-full flex flex-col">
                      <div className="flex items-start gap-4">
                        <button type="button" onClick={() => navigate(`/profile/${person._id}`)} className="w-16 h-16 rounded-2xl bg-primary/10 overflow-hidden shrink-0">
                          {person.photos?.[0] ? <img src={resolveMediaUrl(person.photos[0])} alt={person.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-primary font-serif font-bold text-xl">{person.name?.[0] || 'CA'}</span>}
                        </button>
                        <div className="min-w-0 flex-1">
                          <button type="button" onClick={() => navigate(`/profile/${person._id}`)} className="font-serif font-bold text-lg text-heading hover:text-primary">{person.name || 'CA member'}</button>
                          <p className="text-sm text-muted">{[person.caStatus, person.city].filter(Boolean).join(' · ')}</p>
                          <span className="inline-block mt-2 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {entry.mode === 'exam_buddy' ? 'Exam Buddy' : 'Dating'}
                          </span>
                        </div>
                      </div>
                      <Button className="mt-5 w-full" variant="secondary" onClick={() => handleRestoreProfile(entry)}>
                        <HiArrowUturnLeft size={17} className="mr-1.5 inline" />Show again in Discover
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : matches.length === 0 ? (
          <div className="bg-surface/50 rounded-3xl border border-dashed border-border/80 p-8 sm:p-12 my-6">
            <EmptyState
              icon={tab === 'dating' ? HiHeart : HiAcademicCap}
              title={tab === 'dating' ? 'No dating matches yet' : 'No exam buddies yet'}
              subtitle={
                tab === 'dating'
                  ? 'Keep swiping on Discover to match with fellow CAs and CA students!'
                  : 'Switch to Exam Buddy mode on Discover to connect with study partners for your stage.'
              }
              actionText="Explore Discover"
              onAction={() => navigate('/discover')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matches.map((match, i) => {
              const other = getOtherUser(match);
              return (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Card
                    hover
                    onClick={() => navigate(`/chat/${match._id}`)}
                    className="flex flex-col justify-between h-full p-5 cursor-pointer relative group"
                  >
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-border/60 overflow-hidden shrink-0 relative shadow-sm">
                        {other.photos?.[0] ? (
                          <img
                            src={resolveMediaUrl(other.photos[0])}
                            alt={other.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-serif font-bold">
                            {other.name?.[0] || 'CA'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${other._id}`); }} className="flex-1 min-w-0 text-left rounded-lg focus-visible:outline-2 focus-visible:outline-primary">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-serif font-bold text-lg text-heading truncate">
                            {other.name || 'Anonymous CA'}
                          </h3>
                        </div>

                        {other.caStatus && (
                          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mt-1">
                            {other.caStatus}
                          </span>
                        )}

                        {other.city && (
                          <p className="text-xs text-muted mt-1 truncate">
                            📍 {other.city}
                          </p>
                        )}
                      </button>

                      {/* Unmatch button */}
                      <button
                        type="button"
                        title="Unmatch"
                        aria-label="Unmatch"
                        onClick={(e) => handleUnmatch(e, match._id)}
                        className="text-muted/60 hover:text-error transition-colors p-1 rounded-full hover:bg-error/10 cursor-pointer"
                      >
                        <HiXMark size={18} />
                      </button>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs text-muted">
                        Matched {new Date(match.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${match._id}`);
                        }}
                      >
                        <HiChatBubbleLeftRight size={16} className="mr-1.5 inline" />
                        Message
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
