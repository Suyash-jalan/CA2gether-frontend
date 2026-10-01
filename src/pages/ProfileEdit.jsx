import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FilterChip from '../components/ui/FilterChip';
import IconButton from '../components/ui/IconButton';
import PageTransition from '../components/layout/PageTransition';

const CA_STATUSES = ['CA Foundation', 'CA Inter', 'CA Final', 'Articleship', 'Qualified CA'];
const SPECIALIZATIONS = ['Audit', 'Tax', 'GST', 'Valuation', 'CFO Track', 'Other'];
const FIRM_TYPES = ['Big 4', 'Mid-size', 'Independent', 'Industry'];
const WORK_TAGS = ['Big 4 Hustler', 'Practice Life', 'Industry 9-to-5', 'Prepping for Finals'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function ProfileEdit() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const select = (field, val) => setForm({ ...form, [field]: form[field] === val ? '' : val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileService.updateMyProfile(form);
      await refreshProfile();
      toast.success('Profile updated!', { className: 'toast-success' });
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="page-container">
      <div className="page-container-profile">
        <div className="flex items-center gap-3 mb-6">
          <IconButton icon={HiArrowLeft} onClick={() => navigate('/profile')} label="Back" />
          <h1 className="font-serif text-2xl font-bold text-heading">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-warm-sm space-y-5">
        <Input label="Name" value={form.name || ''} onChange={set('name')} />
        <Input label="Age" type="number" min="18" max="99" value={form.age || ''} onChange={set('age')} />
        <div>
          <p className="text-sm font-medium text-heading mb-2">Gender</p>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g, i) => <FilterChip key={g} label={g} index={i} selected={form.gender === g} onClick={() => select('gender', g)} />)}
          </div>
        </div>
        <Input label="City" value={form.city || ''} onChange={set('city')} />
        <div>
          <label className="text-sm font-medium text-heading">Bio</label>
          <textarea value={form.bio || ''} onChange={set('bio')} maxLength={500} rows={3} className="mt-1.5" />
        </div>
        <div>
          <p className="text-sm font-medium text-heading mb-2">CA Status</p>
          <div className="flex flex-wrap gap-2">
            {CA_STATUSES.map((s, i) => <FilterChip key={s} label={s} index={i} selected={form.caStatus === s} onClick={() => select('caStatus', s)} />)}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-heading mb-2">Specialization</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((s, i) => <FilterChip key={s} label={s} index={i} selected={form.specialization === s} onClick={() => select('specialization', s)} />)}
          </div>
        </div>
        <Input label="Firm / Company" value={form.firmName || ''} onChange={set('firmName')} />
        <div>
          <p className="text-sm font-medium text-heading mb-2">Firm Type</p>
          <div className="flex flex-wrap gap-2">
            {FIRM_TYPES.map((f, i) => <FilterChip key={f} label={f} index={i} selected={form.firmType === f} onClick={() => select('firmType', f)} />)}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-heading mb-2">Work-Life Tag</p>
          <div className="flex flex-wrap gap-2">
            {WORK_TAGS.map((t, i) => <FilterChip key={t} label={t} index={i} selected={form.workLifeTag === t} onClick={() => select('workLifeTag', t)} />)}
          </div>
        </div>
        <Input label="AIR / Rank" type="number" value={form.airRank || ''} onChange={set('airRank')} />

        <Button type="submit" fullWidth loading={loading}>Save Changes</Button>
        </form>
      </div>
    </PageTransition>
  );
}
