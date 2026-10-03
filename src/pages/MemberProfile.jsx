import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { HiArrowLeft, HiMapPin } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { profileService } from '../services/profileService';
import { resolveMediaUrl } from '../utils/media';
import Badge from '../components/ui/Badge';
import IconButton from '../components/ui/IconButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PageTransition from '../components/layout/PageTransition';
import ProfilePosts from '../components/profile/ProfilePosts';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    profileService.getUserProfile(id)
      .then(({ data }) => { if (active) setMember(data.user); })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Could not load this profile');
        navigate('/discover', { replace: true });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, navigate]);

  if (loading) return <div className="page-container"><div className="page-container-profile"><SkeletonLoader type="profile" /></div></div>;
  if (!member) return null;

  const details = [member.caStatus, member.specialization, member.firmType, member.workLifeTag].filter(Boolean);

  return (
    <PageTransition className="page-container">
      <div className="page-container-profile space-y-6">
        <div className="flex items-center gap-3">
          <IconButton icon={HiArrowLeft} onClick={() => navigate(-1)} label="Back" />
          <span className="text-sm font-semibold text-heading">Member profile</span>
        </div>
        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-warm-sm">
          {member.photos?.length ? (
            <div className="grid grid-cols-2 gap-1 bg-border sm:grid-cols-3">
              {member.photos.map((photo, index) => (
                <img key={photo} src={resolveMediaUrl(photo)} alt={`${member.name} photo ${index + 1}`} className={`w-full object-cover ${index === 0 ? 'col-span-2 aspect-[16/10] sm:col-span-3' : 'aspect-square'}`} />
              ))}
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 font-serif text-7xl font-bold text-primary/40">{member.name?.[0] || 'CA'}</div>
          )}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-heading">{member.name}{member.age ? `, ${member.age}` : ''}</h1>
            </div>
            {member.city && <p className="mt-2 flex items-center gap-1 text-sm text-muted"><HiMapPin className="text-primary" /> {member.city}</p>}
            <div className="mt-4 flex flex-wrap gap-2">{details.map((detail) => <Badge key={detail} text={detail} status="neutral" />)}</div>
            {member.bio && <div className="mt-6 border-t border-border pt-5"><h2 className="font-serif text-lg font-bold text-heading">About</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted">{member.bio}</p></div>}
            {member.firmName && <div className="mt-5 rounded-2xl bg-background p-4"><p className="text-xs text-muted">Firm / Company</p><p className="mt-1 font-semibold text-heading">{member.firmName}</p></div>}
          </div>
        </section>
        <ProfilePosts userId={member._id} initialPostId={searchParams.get('post') || ''} />
      </div>
    </PageTransition>
  );
}
