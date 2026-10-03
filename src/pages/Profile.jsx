import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiPencil,
  HiCog6Tooth,
  HiShieldCheck,
  HiCamera,
  HiMapPin,
  HiBuildingOffice2,
  HiTrophy,
  HiAcademicCap,
  HiBriefcase,
  HiTrash,
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageTransition from '../components/layout/PageTransition';
import { profileService } from '../services/profileService';
import toast from 'react-hot-toast';
import { resolveMediaUrl } from '../utils/media';
import ProfilePosts from '../components/profile/ProfilePosts';
import { compressImage } from '../utils/imageCompression';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(!profile);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!profile) {
      refreshProfile().finally(() => setLoading(false));
    }
  }, [profile, refreshProfile]);

  const handleToggle = async (field, value) => {
    try {
      await profileService.updateMyProfile({ [field]: value });
      await refreshProfile();
      const labels = {
        anonymousMode: 'Anonymous mode',
        examBuddyMode: 'Exam buddy mode',
      };
      toast.success(`${labels[field] || 'Setting'} updated`, { className: 'toast-success' });
    } catch {
      toast.error('Failed to update setting', { className: 'toast-error' });
    }
  };

  const handlePhotoUpload = async (e) => {
    const input = e.target;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, 6 - (profile.photos?.length || 0));
    if (!remainingSlots) {
      toast.error('You can upload up to 6 photos. Remove one to add another.');
      return;
    }

    const validFiles = files.slice(0, remainingSlots).filter((file) => {
      const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const validSize = file.size <= 5 * 1024 * 1024;
      if (!validType) toast.error(`${file.name} must be a JPG, PNG, or WebP image.`);
      if (!validSize) toast.error(`${file.name} is larger than 5 MB.`);
      return validType && validSize;
    });
    if (!validFiles.length) return;

    setUploading(true);
    try {
      const compressedFiles = await Promise.all(validFiles.map((file) => compressImage(file)));
      const formData = new FormData();
      compressedFiles.forEach((file) => formData.append('photos', file));
      await profileService.uploadPhotos(formData);
      await refreshProfile();
      toast.success(`${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} uploaded`, { className: 'toast-success' });
    } catch {
      toast.error('Failed to upload photo', { className: 'toast-error' });
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const handleDeletePhoto = async (photoUrl) => {
    try {
      await profileService.deletePhoto(photoUrl);
      await refreshProfile();
      toast.success('Photo removed', { className: 'toast-success' });
    } catch {
      toast.error('Failed to remove photo', { className: 'toast-error' });
    }
  };

  // Profile completeness calculation
  const completeness = (() => {
    if (!profile) return 0;
    const checks = [
      Boolean(profile.name),
      Boolean(profile.photos?.length),
      Boolean(profile.bio),
      Boolean(profile.caStatus),
      Boolean(profile.city),
      Boolean(profile.firmName || profile.firmType),
      Boolean(profile.specialization),
      Boolean(profile.verificationStatus === 'verified'),
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  })();

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-container-profile">
          <SkeletonLoader type="profile" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <PageTransition className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="page-container-profile text-center bg-surface p-8 rounded-3xl border border-border">
          <h2 className="font-serif text-2xl font-bold mb-2">Set up your CA Profile</h2>
          <p className="text-muted text-sm mb-6">
            Complete your profile to discover members and unlock networking in the CA community.
          </p>
          <Button onClick={() => navigate('/profile-setup')}>Get Started</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="page-container">
      <div className="page-container-profile space-y-6">
        {/* Profile Card Header with 24px padding */}
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-warm-sm relative">
          {/* Top Actions Row: Edit, Verification, Settings with clear tooltips & labels */}
          <div className="flex items-center justify-end gap-2 mb-6">
            <button
              type="button"
              title="Edit Profile"
              aria-label="Edit Profile"
              onClick={() => navigate('/profile/edit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-heading bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
            >
              <HiPencil size={15} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              title="ICAI Verification"
              aria-label="ICAI Verification"
              onClick={() => navigate('/verification')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-heading bg-background border border-border hover:border-success/50 hover:text-success transition-colors cursor-pointer"
            >
              <HiShieldCheck size={15} />
              <span>Verify</span>
            </button>

            <button
              type="button"
              title="Settings"
              aria-label="Settings"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-heading bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
            >
              <HiCog6Tooth size={15} />
              <span>Settings</span>
            </button>
          </div>

          {/* Avatar & Photo Upload with Fallback Initials */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20 border-4 border-surface shadow-warm flex items-center justify-center relative"
              >
                {profile.photos?.[0] ? (
                  <img
                    src={resolveMediaUrl(profile.photos[0])}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif font-bold text-4xl sm:text-5xl text-primary/60">
                    {profile.name?.[0] || 'CA'}
                  </span>
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-heading/50 flex items-center justify-center text-white text-xs font-medium backdrop-blur-xs">
                    Uploading...
                  </div>
                )}
              </motion.div>

              {/* Photo Upload Trigger Button */}
              <button
                type="button"
                title="Change profile photo"
                aria-label="Change profile photo"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                <HiCamera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Name & Stage */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heading">
              {profile.name || 'Your Name'}
              {profile.age && <span className="font-normal text-muted text-xl">, {profile.age}</span>}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {profile.city && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <HiMapPin size={14} className="text-primary" /> {profile.city}
                </span>
              )}
              {profile.verificationStatus !== 'verified' && (
                <Badge status={profile.verificationStatus || 'pending'} />
              )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {profile.caStatus && (
                <span className="px-3.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                  {profile.caStatus}
                </span>
              )}
              {profile.firmType && (
                <span className="px-3.5 py-1 bg-secondary/15 text-heading text-xs font-medium rounded-full border border-border">
                  {profile.firmType}
                </span>
              )}
              {profile.specialization && (
                <span className="px-3.5 py-1 bg-success/15 text-success text-xs font-medium rounded-full">
                  {profile.specialization}
                </span>
              )}
              {profile.workLifeTag && (
                <span className="px-3.5 py-1 bg-pass/25 text-heading text-xs font-medium rounded-full">
                  {profile.workLifeTag}
                </span>
              )}
            </div>
          </div>

          <div className="mt-7 border-t border-border/80 pt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-heading">Profile photos</h2>
                <p className="text-xs text-muted">Your first photo is used as your main discovery photo. Up to 6 photos.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || (profile.photos?.length || 0) >= 6}>
                <HiCamera size={16} /> Add photos
              </Button>
            </div>
            {profile.photos?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {profile.photos.map((photo, index) => (
                  <div key={photo} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-background">
                    <img src={resolveMediaUrl(photo)} alt={`${profile.name || 'Profile'} photo ${index + 1}`} className="h-full w-full object-cover" />
                    {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-heading/80 px-2 py-1 text-[10px] font-semibold text-white">Main</span>}
                    <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => handleDeletePhoto(photo)} className="absolute bottom-2 right-2 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-surface/95 text-error shadow-sm transition hover:bg-error hover:text-white">
                      <HiTrash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-32 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-background text-sm font-semibold text-primary hover:border-primary">
                <HiCamera size={20} className="mr-2" /> Upload your first profile photo
              </button>
            )}
          </div>

          {/* Profile Completeness Bar */}
          <div className="mt-7 pt-6 border-t border-border/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-heading">Profile Completeness</span>
              <span className="font-bold text-primary">{completeness}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completeness}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Bio Card */}
        {profile.bio && (
          <div className="bg-surface rounded-3xl border border-border p-6 shadow-warm-sm">
            <h3 className="font-serif text-lg font-bold text-heading mb-2">About Me</h3>
            <p className="text-sm text-heading/80 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        <ProfilePosts userId={profile._id} canCreate initialPostId={searchParams.get('post') || ''} />

        {/* Professional Details Card (24px padding) */}
        <div className="bg-surface rounded-3xl border border-border p-6 shadow-warm-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-heading">Professional Credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {profile.firmName && (
              <div className="p-3.5 rounded-2xl bg-background border border-border/70 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <HiBuildingOffice2 size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted">Firm Name</p>
                  <p className="font-semibold text-heading">{profile.firmName}</p>
                </div>
              </div>
            )}

            {profile.caStatus && (
              <div className="p-3.5 rounded-2xl bg-background border border-border/70 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <HiAcademicCap size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted">Stage</p>
                  <p className="font-semibold text-heading">{profile.caStatus}</p>
                </div>
              </div>
            )}

            {profile.airRank && (
              <div className="p-3.5 rounded-2xl bg-background border border-border/70 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <HiTrophy size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted">All India Rank</p>
                  <p className="font-semibold text-heading">AIR #{profile.airRank}</p>
                </div>
              </div>
            )}

            {profile.specialization && (
              <div className="p-3.5 rounded-2xl bg-background border border-border/70 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <HiBriefcase size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted">Specialization</p>
                  <p className="font-semibold text-heading">{profile.specialization}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Card with 24px padding and proper 16px row dividers */}
        <div className="bg-surface rounded-3xl border border-border p-6 shadow-warm-sm">
          <div className="mb-4">
            <h3 className="font-serif text-lg font-bold text-heading">Privacy & Visibility</h3>
            <p className="text-xs text-muted mt-0.5">
              Control how your identity and profile are displayed across CA2gether.
            </p>
          </div>

          <div className="divide-y divide-border/80">
            <ToggleSwitch
              checked={profile.anonymousMode || false}
              onChange={(v) => handleToggle('anonymousMode', v)}
              label="Anonymous Mode"
              description="Hide your real name and photos from discovery cards to browse privately."
            />

            <ToggleSwitch
              checked={profile.examBuddyMode || false}
              onChange={(v) => handleToggle('examBuddyMode', v)}
              label="Exam Buddy Mode"
              description="Switch default mode to find exam study partners rather than dating matches."
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
