import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiPaperAirplane,
  HiArrowLeft,
  HiEllipsisVertical,
  HiChatBubbleLeftRight,
  HiMagnifyingGlass,
  HiSparkles,
  HiPhoto,
} from 'react-icons/hi2';
import { chatService } from '../services/chatService';
import { matchService } from '../services/matchService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import IconButton from '../components/ui/IconButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import PageTransition from '../components/layout/PageTransition';
import { resolveMediaUrl } from '../utils/media';
import { compressImage } from '../utils/imageCompression';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-surface/80 rounded-2xl w-fit border border-border">
      <span className="text-xs text-muted font-medium">Typing</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-primary/60 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message, isOwn, index }) {
  const isImage = message.type === 'image' && message.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index < 6 ? index * 0.04 : 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[78%] sm:max-w-[70%] ${isImage ? 'p-1.5' : 'px-4 py-3'} rounded-2xl text-sm leading-relaxed shadow-sm ${
          isOwn
            ? 'bg-primary text-white rounded-br-xs'
            : 'bg-surface border border-border text-heading rounded-bl-xs'
        }`}
      >
        {isImage && (
          <a href={resolveMediaUrl(message.imageUrl)} target="_blank" rel="noreferrer" className="relative block">
            <img
              src={resolveMediaUrl(message.imageUrl)}
              alt="Shared in chat"
              loading="lazy"
              className={`max-h-80 w-full rounded-xl object-cover ${message.pendingUpload ? 'opacity-70' : ''}`}
            />
            {message.pendingUpload && (
              <span className="absolute inset-x-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-center text-[10px] font-semibold text-white">
                Sending…
              </span>
            )}
          </a>
        )}
        {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
        <div
          className={`text-[10px] mt-1 flex items-center justify-end gap-1 font-medium ${
            isOwn ? 'text-white/70' : 'text-muted'
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {isOwn && !message.pendingUpload && (
            <span
              title={message.readAt ? 'Read' : 'Sent'}
              aria-label={message.readAt ? 'Read' : 'Sent'}
              className={message.readAt ? 'font-bold text-sky-300 tracking-[-0.18em] pr-0.5' : 'text-white/75'}
            >
              {message.readAt ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { connect } = useSocket();
  const navigate = useNavigate();

  // Match list & state
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const openedMatchRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);

  const appendMessage = useCallback((message) => {
    setMessages((current) => {
      if (current.some((item) => item._id === message._id)) return current;

      const senderId = message.sender?._id || message.sender;
      const pendingIndex = message.type === 'image' && senderId === user?.id
        ? current.findIndex((item) => item.pendingUpload)
        : -1;
      if (pendingIndex === -1) return [...current, message];

      const updated = [...current];
      updated[pendingIndex] = message;
      return updated;
    });
  }, [user?.id]);

  const removeMessage = useCallback((messageId) => {
    setMessages((current) => current.filter((item) => item._id !== messageId));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch match list for the left pane
  const fetchMatches = useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingMatches(true);
    try {
      const { data } = await matchService.getMatches();
      setMatches(data.data || []);
    } catch {
      toast.error('Failed to load conversations', { className: 'toast-error' });
    } finally {
      if (showLoading) setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Active match data
  const activeMatch = useMemo(() => {
    if (!matchId) return null;
    return matches.find((m) => m._id === matchId);
  }, [matchId, matches]);

  const otherUser = useMemo(() => {
    if (!activeMatch) return null;
    return activeMatch.users?.find((u) => u._id !== user?.id) || {};
  }, [activeMatch, user]);

  // Load chat messages when matchId changes
  useEffect(() => {
    if (!matchId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await chatService.getMessages(matchId, { limit: 50 });
        setMessages(data.data || []);
        setMatches((current) => current.map((match) => (
          match._id === matchId ? { ...match, unreadCount: 0 } : match
        )));
      } catch {
        toast.error('Failed to load messages', { className: 'toast-error' });
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [matchId]);

  // Socket.io integration
  useEffect(() => {
    if (!matchId) return;
    const socket = connect();
    if (!socket) return;
    socketRef.current = socket;

    socket.emit('join_chat', { matchId });

    socket.on('new_message', (msg) => {
      appendMessage(msg);
      setTyping(false);
      const senderId = msg.sender?._id || msg.sender;
      if (senderId !== user?.id) {
        socket.emit('mark_read', { matchId });
        setMatches((current) => current.map((match) => (
          match._id === matchId ? { ...match, unreadCount: 0 } : match
        )));
      }
    });

    socket.on('messages_read', ({ messageIds = [], readAt }) => {
      const readIds = new Set(messageIds);
      setMessages((current) => current.map((message) => (
        readIds.has(message._id) ? { ...message, readAt } : message
      )));
    });

    const handleUnreadChanged = () => fetchMatches(false);
    socket.on('chat_unread_changed', handleUnreadChanged);

    socket.on('user_typing', () => setTyping(true));
    socket.on('user_stop_typing', () => setTyping(false));
    socket.on('error_msg', ({ message }) => toast.error(message, { className: 'toast-error' }));

    return () => {
      socket.emit('leave_chat', { matchId });
      socket.off('new_message');
      socket.off('messages_read');
      socket.off('chat_unread_changed', handleUnreadChanged);
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('error_msg');
    };
  }, [matchId, connect, appendMessage, user?.id, fetchMatches]);

  useLayoutEffect(() => {
    if (loadingMessages || !matchId || openedMatchRef.current === matchId) return;
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
    openedMatchRef.current = matchId;
  }, [matchId, loadingMessages, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !matchId) return;
    socketRef.current.emit('send_message', { matchId, content: input.trim() });
    socketRef.current.emit('stop_typing', { matchId });
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socketRef.current && matchId) {
      socketRef.current.emit('typing', { matchId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { matchId });
      }, 2000);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !matchId || uploadingImage) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Choose an image smaller than 10 MB');
      return;
    }

    const temporaryId = `upload-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    appendMessage({
      _id: temporaryId,
      match: matchId,
      sender: { _id: user?.id },
      type: 'image',
      imageUrl: previewUrl,
      createdAt: new Date().toISOString(),
      pendingUpload: true,
    });
    setUploadingImage(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 1080, quality: 0.75 });
      if (compressed.size > 5 * 1024 * 1024) {
        removeMessage(temporaryId);
        toast.error('The optimized image is still larger than 5 MB');
        return;
      }
      const formData = new FormData();
      formData.append('image', compressed);
      const { data } = await chatService.sendImage(matchId, formData);
      appendMessage(data.data);
    } catch (error) {
      removeMessage(temporaryId);
      toast.error(error.response?.data?.message || 'Failed to send image');
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingImage(false);
    }
  };

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    return matches.filter((m) => {
      const u = m.users?.find((u) => u._id !== user?.id) || {};
      return u.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [matches, searchQuery, user]);

  return (
    <PageTransition className="page-container py-4 sm:py-6">
      <div className="w-full h-[calc(100dvh-200px)] md:h-[calc(100dvh-140px)] min-h-[400px] max-h-[850px] bg-surface rounded-3xl border border-border shadow-warm overflow-hidden flex flex-col md:flex-row">
        {/* ── Left Pane: Conversation List ──────────────────────── */}
        <div
          className={`
            w-full md:w-[280px] lg:w-[320px] shrink-0 border-r border-border flex flex-col h-full bg-surface
            ${matchId ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-2xl font-bold text-heading">Messages</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {matches.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <HiMagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2 rounded-full border border-border bg-background focus:bg-surface"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loadingMatches ? (
              <div className="p-4 space-y-3">
                <SkeletonLoader type="card" count={3} />
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="p-8 text-center my-auto">
                <HiChatBubbleLeftRight size={36} className="mx-auto text-muted/50 mb-2" />
                <p className="font-serif font-semibold text-heading text-sm mb-1">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-xs text-muted mb-4">
                  {searchQuery
                    ? 'Try searching a different name'
                    : 'Match with CAs on Discover to start a chat'}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => navigate('/discover')}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Go to Discover &rarr;
                  </button>
                )}
              </div>
            ) : (
              filteredMatches.map((m) => {
                const partner = m.users?.find((u) => u._id !== user?.id) || {};
                const isSelected = m._id === matchId;

                return (
                  <div
                    key={m._id}
                    onClick={() => navigate(`/chat/${m._id}`)}
                    className={`flex items-center gap-3.5 p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : 'hover:bg-background/80'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-border/60 relative">
                      {partner.photos?.[0] ? (
                        <img
                          src={resolveMediaUrl(partner.photos[0])}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-serif font-bold text-lg">
                          {partner.name?.[0] || 'CA'}
                        </div>
                      )}
                    </div>

                    {/* Partner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`font-serif text-sm font-semibold truncate ${
                            isSelected ? 'text-primary' : 'text-heading'
                          }`}
                        >
                          {partner.name || 'Anonymous CA'}
                        </h4>
                        <span className="text-[10px] text-muted shrink-0">
                          {new Date(m.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-xs text-muted truncate">
                          {partner.caStatus || 'Chartered Accountant'}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {m.mode === 'exam_buddy' && (
                            <span className="text-[9px] font-semibold text-success bg-success/15 px-1.5 py-0.2 rounded-full">
                              Study
                            </span>
                          )}
                          {m.unreadCount > 0 && !isSelected && (
                            <span className="min-w-[19px] h-[19px] px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                              {m.unreadCount > 9 ? '9+' : m.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Pane: Chat Window ───────────────────────────── */}
        <div
          className={`
            flex-1 min-w-0 flex flex-col h-full bg-background/30 overflow-hidden
            ${!matchId ? 'hidden md:flex' : 'flex'}
          `}
        >
          {!matchId ? (
            /* Empty state when no conversation is selected on desktop */
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={HiChatBubbleLeftRight}
                title="Select a match to start chatting"
                subtitle="Choose a conversation from the left to break the ice and talk about audit, exams, and life."
                actionText="Explore Matches"
                onAction={() => navigate('/matches')}
              />
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border bg-surface/90 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <IconButton
                    icon={HiArrowLeft}
                    onClick={() => navigate('/chat')}
                    label="Back to conversations"
                    className="md:hidden shrink-0"
                  />

                  <button
                    type="button"
                    onClick={() => otherUser?._id && navigate(`/profile/${otherUser._id}`)}
                    disabled={!otherUser?._id}
                    aria-label={`View ${otherUser?.name || 'member'} profile`}
                    className="flex min-w-0 items-center gap-3 rounded-xl text-left transition-colors hover:bg-background/80 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default px-1 py-0.5"
                  >
                    {/* Partner Avatar */}
                    <span className="w-10 h-10 rounded-full overflow-hidden bg-border/60 shrink-0">
                      {otherUser?.photos?.[0] ? (
                        <img
                          src={resolveMediaUrl(otherUser.photos[0])}
                          alt={otherUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-serif font-bold">
                          {otherUser?.name?.[0] || 'CA'}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block font-serif font-bold text-base text-heading truncate hover:text-primary">
                        {otherUser?.name || 'Anonymous CA'}
                      </span>
                      <span className="block text-xs text-muted truncate">
                        {otherUser?.caStatus || 'CA Community'} {otherUser?.city ? `• ${otherUser.city}` : ''}
                      </span>
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <IconButton
                    icon={HiEllipsisVertical}
                    onClick={() => navigate('/matches')}
                    label="More Options"
                  />
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5">
                {loadingMessages ? (
                  <SkeletonLoader type="chat" count={5} />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <HiSparkles size={28} />
                    </div>
                    <h4 className="font-serif font-bold text-lg text-heading mb-1">
                      Say hello to {otherUser?.name || 'your match'}!
                    </h4>
                    <p className="text-muted text-xs max-w-xs mb-4">
                      Send a message to start the conversation.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <MessageBubble
                        key={msg._id || i}
                        message={msg}
                        isOwn={msg.sender?._id === user?.id || msg.sender === user?.id}
                        index={i}
                      />
                    ))}
                    {typing && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Bar */}
              <div className="p-3 sm:p-4 border-t border-border bg-surface">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2 max-w-4xl mx-auto"
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <motion.button
                    type="button"
                    aria-label="Send an image"
                    title="Send an image"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-full border border-border bg-background text-primary flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    <HiPhoto size={20} className={uploadingImage ? 'animate-pulse' : ''} />
                  </motion.button>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full px-5 py-2.5 text-sm border border-border bg-background focus:bg-surface"
                  />
                  <motion.button
                    type="submit"
                    aria-label="Send message"
                    disabled={!input.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-sm disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    <HiPaperAirplane size={18} />
                  </motion.button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
