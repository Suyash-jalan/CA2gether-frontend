import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiShieldCheck,
  HiArrowUpTray,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiInformationCircle,
  HiDocumentText,
  HiArrowLeft
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Verification() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('icai_card');
  const [icaiNumber, setIcaiNumber] = useState(profile?.icaiRegNumber || '');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const verificationStatus = profile?.verificationStatus || user?.verificationStatus || 'none';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be under 5MB');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a verification document to upload');
      return;
    }
    if (!icaiNumber.trim()) {
      toast.error('Please provide your CA registration or membership number');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('docType', docType);
      formData.append('icaiRegNumber', icaiNumber.trim());

      await profileService.uploadVerification(formData);
      toast.success('Verification submitted successfully! Our team will review within 24 hours.');
      await refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-container-feed space-y-6">
        {/* Back and Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-surface text-muted hover:text-heading transition-colors cursor-pointer"
          >
            <HiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-heading">
              Verification
            </h1>
            <p className="text-sm text-muted">
              Fast-track your trust on CA2gether with an official verification badge
            </p>
          </div>
        </div>

        {/* Current Status Card */}
        <Card className="p-6 border border-border bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <HiShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-heading">Verification Status</h3>
                <p className="text-xs text-muted">
                  {verificationStatus === 'verified' && 'Your credentials have been validated.'}
                  {verificationStatus === 'pending' && 'Your documents are currently under review.'}
                  {verificationStatus === 'rejected' && 'Previous submission could not be verified. Please re-upload.'}
                  {verificationStatus === 'none' && 'You have not submitted verification documents yet.'}
                </p>
              </div>
            </div>
            <div>
              {verificationStatus === 'verified' && (
                <Badge variant="verified" text="Verified" icon={<HiCheckCircle />} />
              )}
              {verificationStatus === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <HiClock size={14} /> Under Review
                </span>
              )}
              {verificationStatus === 'rejected' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                  <HiXCircle size={14} /> Rejected
                </span>
              )}
              {verificationStatus === 'none' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  Not Submitted
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Why Verify Info Banner */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-3 items-start">
          <HiInformationCircle className="text-primary mt-0.5 shrink-0" size={20} />
          <div className="text-xs text-muted leading-relaxed">
            <span className="font-semibold text-heading">Why get verified?</span>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Show your verified status on your account</li>
              <li>Get prioritized discovery matching with fellow CAs and articles</li>
              <li>Unlock full community privileges in CA Lounge & Events</li>
              <li>Your sensitive documents are encrypted and kept strictly confidential</li>
            </ul>
          </div>
        </div>

        {/* Upload Form (If not verified, or if rejected/none) */}
        {verificationStatus !== 'verified' && (
          <Card className="p-6 border border-border bg-surface">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-heading mb-1">
                  CA Membership / Student Registration Number (MRN / WRO / NRO / SRO / ERO)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CRO123456 or 6-digit Membership No."
                  value={icaiNumber}
                  onChange={(e) => setIcaiNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-heading mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full"
                >
                  <option value="icai_card">CA Student ID / Admit Card</option>
                  <option value="membership_certificate">CA Membership Certificate (COP / Associate)</option>
                  <option value="articleship_letter">Articleship Registration Letter (Form 102/103)</option>
                  <option value="mark_sheet">CA Exam Result / Marks Statement</option>
                </select>
              </div>

              {/* Upload Drop Area */}
              <div>
                <label className="block text-sm font-semibold text-heading mb-1">
                  Upload Document or Photo (PNG, JPG, PDF up to 5MB)
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl cursor-pointer bg-background/50 hover:bg-background transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="space-y-2 text-center">
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        className="max-h-48 rounded-xl object-contain mx-auto shadow-sm"
                      />
                      <p className="text-xs text-muted">{selectedFile?.name}</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <HiDocumentText size={24} />
                      <span className="text-sm">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiArrowUpTray size={24} />
                      </div>
                      <p className="text-sm font-medium text-heading">
                        Click to browse or drag & drop document
                      </p>
                      <p className="text-xs text-muted">
                        Ensure your name and registration/membership number are clearly visible
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                disabled={uploading}
              >
                {uploading ? 'Submitting for Review...' : 'Submit Verification Request'}
              </Button>
            </form>
          </Card>
        )}

        {verificationStatus === 'verified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center bg-surface border border-success/30 rounded-2xl space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
              <HiShieldCheck size={36} />
            </div>
            <h2 className="text-xl font-bold font-serif text-heading">Verification approved</h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              Your profile carries the prestigious badge of authentic CA community membership. Thank you for keeping CA2gether genuine and trusted.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="mt-4"
            >
              View My Profile
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
