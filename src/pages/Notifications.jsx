import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiBell,
  HiHeart,
  HiChatBubbleLeftRight,
  HiUserGroup,
  HiShieldCheck,
  HiCheck,
  HiArrowLeft
} from 'react-icons/hi2';
import { notificationService } from '../services/notificationService';
import { forumService } from '../services/forumService';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
        const res = await notificationService.getNotifications(params);
        const data = res.data?.data || res.data?.notifications || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [filter]);

  const getNotificationCopy = (notif) => {
    const data = notif.data || {};
    switch (notif.type) {
      case 'new_match':
        return { title: 'You have a new match', message: 'Open your connections and start a conversation.' };
      case 'new_message':
        return { title: 'New message', message: data.preview || 'A connection sent you a message.' };
      case 'verification_update':
        return {
          title: data.status === 'verified' ? 'Verification approved' : 'Verification update',
          message: data.status === 'verified' ? 'Your verified badge is now active.' : data.reason || 'Review your verification status.',
        };
      case 'lounge_comment':
        return { title: 'New reply to your post', message: data.preview || 'A member joined your discussion.' };
      case 'report_action':
        return { title: 'Safety report update', message: data.message || 'Your report has been reviewed.' };
      default:
        return { title: notif.title || 'CA2gether update', message: notif.content || notif.message || data.message || 'You have a new update.' };
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Could not mark all as read');
    }
  };

  const handleClickItem = async (notif) => {
    const notifId = notif._id || notif.id;
    if (!notif.isRead && !notif.read) {
      await handleMarkAsRead(notifId);
    }

    // Direct user based on notification type
    const type = notif.type;
    if (type === 'match' || type === 'new_match' || type === 'superlike') {
      navigate('/matches');
    } else if (type === 'message' || type === 'new_message') {
      navigate(notif.data?.matchId ? `/chat/${notif.data.matchId}` : '/chat');
    } else if (type === 'lounge_post' || type === 'lounge_comment') {
      const postId = notif.data?.postId;
      if (!postId) {
        navigate('/lounge');
        return;
      }

      let postKind = notif.data?.postKind;
      let authorId = notif.data?.authorId;
      if (!postKind || !authorId) {
        try {
          const { data } = await forumService.getPost(postId);
          postKind = data.data?.kind;
          authorId = data.data?.author?._id || data.data?.author;
        } catch {
          navigate('/lounge');
          return;
        }
      }

      if (postKind === 'profile') {
        const profilePath = authorId === user?.id ? '/profile' : `/profile/${authorId}`;
        navigate(`${profilePath}?post=${postId}`);
      } else {
        navigate(`/posts/${postId}`);
      }
    } else if (type?.includes('verification')) {
      navigate('/verification');
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'match':
      case 'new_match':
      case 'like':
      case 'superlike':
        return <HiHeart className="text-primary" size={20} />;
      case 'message':
      case 'new_message':
        return <HiChatBubbleLeftRight className="text-secondary" size={20} />;
      case 'lounge_post':
      case 'lounge_comment':
        return <HiUserGroup className="text-amber-600" size={20} />;
      case 'verification_approved':
      case 'verification_rejected':
      case 'verification':
        return <HiShieldCheck className="text-success" size={20} />;
      default:
        return <HiBell className="text-muted" size={20} />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-container-feed space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-surface text-muted hover:text-heading transition-colors cursor-pointer"
            >
              <HiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-serif font-bold text-heading">Notifications</h1>
          </div>
          {notifications.some((n) => !n.isRead && !n.read) && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HiCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-surface rounded-full border border-border w-fit">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-heading'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-heading'
            }`}
          >
            Unread
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            <SkeletonLoader variant="card" count={4} />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={HiBell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="When peers match with you, message you, or interact with your lounge posts, you'll see them here."
          />
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {notifications.map((notif) => {
                const isRead = notif.isRead || notif.read;
                const copy = getNotificationCopy(notif);
                return (
                  <motion.div
                    key={notif._id || notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleClickItem(notif)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isRead
                        ? 'bg-surface/60 border-border opacity-85 hover:opacity-100 hover:bg-surface'
                        : 'bg-surface border-primary/25 shadow-warm-sm'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-heading">
                          {copy.title}
                        </p>
                        <span className="text-[11px] text-muted shrink-0">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">
                        {copy.message}
                      </p>
                    </div>
                    {!isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 self-center" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
