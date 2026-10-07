import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiArrowLeft,
  HiEye,
  HiBell,
  HiShieldExclamation,
  HiTrash,
  HiArrowRightOnRectangle,
  HiUserMinus
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { safetyService } from '../services/safetyService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const DISCOVERY_VISIBILITY_OPTIONS = [
  {
    value: 'both',
    label: 'Dating & Exam Buddy',
    description: 'Show your profile in both discovery sections.',
  },
  {
    value: 'dating',
    label: 'Dating only',
    description: 'Hide your profile from Exam Buddy.',
  },
  {
    value: 'exam_buddy',
    label: 'Exam Buddy only',
    description: 'Hide your profile from Dating.',
  },
];

export default function Settings() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Privacy toggles
  const [anonymousMode, setAnonymousMode] = useState(profile?.anonymousMode ?? false);
  const [examBuddyMode, setExamBuddyMode] = useState(profile?.examBuddyMode ?? false);
  const [discoveryVisibility, setDiscoveryVisibility] = useState(profile?.discoveryVisibility ?? 'both');

  // Notifications toggles
  const [notifMatches, setNotifMatches] = useState(profile?.notificationPreferences?.matches ?? true);
  const [notifLounge, setNotifLounge] = useState(profile?.notificationPreferences?.lounge ?? true);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  // Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setLoadingBlocked(true);
        const res = await safetyService.getBlockedUsers();
        const payload = res.data;
        const users = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.blockedUsers)
            ? payload.blockedUsers
            : Array.isArray(payload)
              ? payload
              : [];
        setBlockedUsers(users);
      } catch {
        /* Keep settings usable if the block list is temporarily unavailable. */
      } finally {
        setLoadingBlocked(false);
      }
    };
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (blockedUserId) => {
    try {
      await safetyService.unblockUser(blockedUserId);
      toast.success('User unblocked successfully');
      setBlockedUsers((prev) => prev.filter((u) => u._id !== blockedUserId && u.id !== blockedUserId));
    } catch {
      toast.error('Failed to unblock user');
    }
  };

  const handlePrivacyToggle = async (key, value) => {
    try {
      setIsUpdatingPrivacy(true);
      await profileService.updateMyProfile({ [key]: value });
      if (key === 'anonymousMode') setAnonymousMode(value);
      if (key === 'examBuddyMode') setExamBuddyMode(value);
      toast.success('Privacy settings updated');
      await refreshProfile();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const handleNotificationToggle = async (key, value) => {
    const next = { matches: notifMatches, lounge: notifLounge, [key]: value };
    if (key === 'matches') setNotifMatches(value);
    if (key === 'lounge') setNotifLounge(value);
    try {
      await profileService.updateMyProfile({ notificationPreferences: next });
      await refreshProfile();
      toast.success('Notification preferences updated');
    } catch {
      if (key === 'matches') setNotifMatches(!value);
      if (key === 'lounge') setNotifLounge(!value);
      toast.error('Failed to save notification preference');
    }
  };

  const handleDiscoveryVisibility = async (value) => {
    const previous = discoveryVisibility;
    setDiscoveryVisibility(value);
    try {
      setIsUpdatingPrivacy(true);
      await profileService.updateMyProfile({ discoveryVisibility: value });
      await refreshProfile();
      toast.success('Discovery visibility updated');
    } catch {
      setDiscoveryVisibility(previous);
      toast.error('Failed to save discovery visibility');
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await profileService.deactivateAccount();
      toast.success('Account deactivated');
      await logout();
      navigate('/login');
    } catch {
      toast.error('Failed to deactivate account');
    }
  };

  const closeDeleteModal = () => {
    if (deletingAccount) return;
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteConfirmation('');
  };

  const handleDeleteAccount = async () => {
    const googleOnlyAccount = user?.authProvider === 'google';
    if ((!googleOnlyAccount && !deletePassword) || deleteConfirmation !== 'DELETE') return;
    try {
      setDeletingAccount(true);
      await profileService.deleteAccount({
        password: deletePassword,
        confirmation: deleteConfirmation,
      });
      toast.success('Your account has been permanently deleted');
      await logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-container-feed space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-surface text-muted hover:text-heading transition-colors cursor-pointer"
          >
            <HiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-serif font-bold text-heading">Settings & Privacy</h1>
        </div>

        {/* Discovery & Privacy */}
        <Card className="p-6 border border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <HiEye size={20} />
            <h2>Discovery & Visibility</h2>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-sm font-semibold text-heading">Show my profile in</p>
              <p className="text-xs text-muted mt-0.5 mb-3">Choose where other members can discover you.</p>
              <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Discovery visibility">
                {DISCOVERY_VISIBILITY_OPTIONS.map((option) => {
                  const selected = discoveryVisibility === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={isUpdatingPrivacy}
                      onClick={() => handleDiscoveryVisibility(option.value)}
                      className={`min-h-24 rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? 'border-primary bg-primary/10 text-heading ring-1 ring-primary/30'
                          : 'border-border bg-background text-heading hover:border-primary/50'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-heading">Anonymous Mode</p>
                <p className="text-xs text-muted">Hide your name and photos from discovery cards</p>
              </div>
              <ToggleSwitch
                checked={anonymousMode}
                onChange={(val) => handlePrivacyToggle('anonymousMode', val)}
                disabled={isUpdatingPrivacy}
              />
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-heading">Exam Buddy Mode</p>
                <p className="text-xs text-muted">Prioritize study partners and exam-focused connections</p>
              </div>
              <ToggleSwitch
                checked={examBuddyMode}
                onChange={(val) => handlePrivacyToggle('examBuddyMode', val)}
                disabled={isUpdatingPrivacy}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 border border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <HiBell size={20} />
            <h2>Push & In-App Notifications</h2>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-heading">New Matches & Mutual Likes</p>
                <p className="text-xs text-muted">Get notified when a peer matches with you</p>
              </div>
              <ToggleSwitch checked={notifMatches} onChange={(value) => handleNotificationToggle('matches', value)} label="New matches and mutual likes" />
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-heading">CA Lounge & Event Updates</p>
                <p className="text-xs text-muted">Replies to your posts, discussions, or event invites</p>
              </div>
              <ToggleSwitch checked={notifLounge} onChange={(value) => handleNotificationToggle('lounge', value)} label="CA Lounge and event updates" />
            </div>
          </div>
        </Card>

        {/* Blocked Users */}
        <Card className="p-6 border border-border bg-surface space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <HiShieldExclamation size={20} />
            <h2>Blocked Members</h2>
          </div>
          {loadingBlocked ? (
            <p className="text-xs text-muted">Loading blocked accounts...</p>
          ) : blockedUsers.length === 0 ? (
            <p className="text-xs text-muted">You have not blocked any members.</p>
          ) : (
            <div className="divide-y divide-border">
              {blockedUsers.map((b) => (
                <div key={b._id || b.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted text-xs">
                      {(b.name || b.fullName)?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-heading">{b.name || b.fullName || 'User'}</p>
                      <p className="text-xs text-muted">{b.caStatus || 'CA Member'}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnblock(b._id || b.id)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border border-error/30 bg-surface space-y-4">
          <div className="flex items-center gap-2 text-error font-semibold">
            <HiTrash size={20} />
            <h2>Account Actions</h2>
          </div>
          <p className="text-xs text-muted">
            Deactivating your account hides your profile from discovery and search until you sign back in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeactivateModal(true)}
              className="text-error border-error/50 hover:bg-error/10"
            >
              <HiUserMinus size={18} /> Deactivate Account
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="text-error border-error/50 hover:bg-error/10"
            >
              <HiTrash size={18} /> Delete Permanently
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              <HiArrowRightOnRectangle size={18} /> Sign Out
            </Button>
          </div>
        </Card>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          title="Deactivate Account?"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Are you sure you want to deactivate your CA2gether account? Your profile will not be shown to others. You can reactivate at any time simply by logging back in.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDeactivate} className="bg-error hover:bg-error/90 text-white">
                Yes, Deactivate
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Permanently delete account?"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-error/30 bg-error/5 p-4">
              <p className="text-sm font-semibold text-error">This action cannot be undone.</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Your profile, matches, messages, posts, comments, uploaded photos, and other account data will be permanently removed.
              </p>
            </div>
            {user?.authProvider !== 'google' && <Input
              id="delete-password"
              label="Current password"
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />}
            <Input
              id="delete-confirmation"
              label="Type DELETE to confirm"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeDeleteModal} disabled={deletingAccount}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteAccount}
                loading={deletingAccount}
                disabled={(user?.authProvider !== 'google' && !deletePassword) || deleteConfirmation !== 'DELETE' || deletingAccount}
                className="bg-error hover:bg-error/90 text-white"
              >
                Delete my account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
