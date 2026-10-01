import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FilterChip from '../components/ui/FilterChip';
import PageTransition from '../components/layout/PageTransition';

const STEPS = ['Basic Info', 'CA Status', 'Professional', 'Lifestyle', 'Exam History', 'Photos'];

const CA_STATUSES = ['CA Foundation', 'CA Inter', 'CA Final', 'Articleship', 'Qualified CA'];
const SPECIALIZATIONS = ['Audit', 'Tax', 'GST', 'Valuation', 'CFO Track', 'Other'];
const FIRM_TYPES = ['Big 4', 'Mid-size', 'Independent', 'Industry'];
const WORK_TAGS = ['Big 4 Hustler', 'Practice Life', 'Industry 9-to-5', 'Prepping for Finals'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function ProfileSetup() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', age: '', gender: '', city: '', bio: '',
    caStatus: '', specialization: '', firmName: '', firmType: '',
    workLifeTag: '', examHistory: [], airRank: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const select = (field, val) => setForm({ ...form, [field]: form[field] === val ? '' : val });

  const nextStep = () => { setDirection(1); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const prevStep = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setPhotos(files);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const profileData = { ...form };
      if (profileData.age) profileData.age = parseInt(profileData.age, 10);
      if (profileData.airRank) profileData.airRank = parseInt(profileData.airRank, 10);
      else delete profileData.airRank;

      await profileService.updateMyProfile(profileData);

      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((f) => formData.append('photos', f));
        await profileService.uploadPhotos(formData);
      }

      await refreshProfile();
      toast.success('Profile created!', { className: 'toast-success' });
      navigate('/discover');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile', { className: 'toast-error' });
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={set('name')} placeholder="Your full name" />
          <Input label="Age" type="number" min="18" max="99" value={form.age} onChange={set('age')} placeholder="Your age" />
          <div>
            <p className="text-sm font-medium text-heading mb-2">Gender</p>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g, i) => <FilterChip key={g} label={g} index={i} selected={form.gender === g} onClick={() => select('gender', g)} />)}
            </div>
          </div>
          <Input label="City" value={form.city} onChange={set('city')} placeholder="Mumbai, Delhi…" />
          <div>
            <label className="text-sm font-medium text-heading">Bio</label>
            <textarea value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself…" maxLength={500} rows={3} className="mt-1.5" />
            <p className="text-xs text-muted mt-1">{form.bio.length}/500</p>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-heading mb-3">CA Status</p>
            <div className="flex flex-wrap gap-2">
              {CA_STATUSES.map((s, i) => <FilterChip key={s} label={s} index={i} selected={form.caStatus === s} onClick={() => select('caStatus', s)} />)}
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-heading mb-3">Specialization</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map((s, i) => <FilterChip key={s} label={s} index={i} selected={form.specialization === s} onClick={() => select('specialization', s)} />)}
            </div>
          </div>
          <Input label="Firm / Company" value={form.firmName} onChange={set('firmName')} placeholder="Optional" />
          <div>
            <p className="text-sm font-medium text-heading mb-3">Firm Type</p>
            <div className="flex flex-wrap gap-2">
              {FIRM_TYPES.map((f, i) => <FilterChip key={f} label={f} index={i} selected={form.firmType === f} onClick={() => select('firmType', f)} />)}
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-5">
          <p className="text-sm font-medium text-heading mb-3">Work-Life Tag</p>
          <div className="flex flex-wrap gap-2">
            {WORK_TAGS.map((t, i) => <FilterChip key={t} label={t} index={i} selected={form.workLifeTag === t} onClick={() => select('workLifeTag', t)} />)}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <Input label="AIR / All India Rank (optional)" type="number" value={form.airRank} onChange={set('airRank')} placeholder="e.g. 42" />
          <p className="text-xs text-muted">You can add detailed exam history later from your profile settings.</p>
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-heading">Upload up to 6 photos</p>
          <input type="file" accept="image/jpeg,image/png" multiple onChange={handlePhotoChange} className="text-sm" />
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((f, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-[12px] overflow-hidden bg-border">
                  <img src={URL.createObjectURL(f)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted mb-2">
              <span>{STEPS[step]}</span>
              <span>{step + 1} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="bg-surface rounded-[20px] p-6 border border-border shadow-[0_4px_16px_rgba(217,105,74,0.1)] relative overflow-hidden min-h-[320px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <h2 className="font-serif text-xl font-semibold mb-5">{STEPS[step]}</h2>
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <Button variant="outline" onClick={prevStep}>Back</Button>
            ) : <div />}
            {step < STEPS.length - 1 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>Complete Setup</Button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
