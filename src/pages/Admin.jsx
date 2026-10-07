import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiShieldCheck,
  HiExclamationTriangle,
  HiClipboardDocumentList,
  HiUserGroup,
  HiCheck,
  HiXMark,
  HiArrowLeft,
  HiDocumentMagnifyingGlass,
  HiNoSymbol
  , HiNewspaper
} from 'react-icons/hi2';
import { adminService } from '../services/adminService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import AdminNews from '../components/admin/AdminNews';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'reports' | 'flagged' | 'logs'
  const [loading, setLoading] = useState(false);
  const [totalAccounts, setTotalAccounts] = useState(null);

  // Verifications
  const [verifications, setVerifications] = useState([]);
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Reports
  const [reports, setReports] = useState([]);
  const [reportActionModal, setReportActionModal] = useState(null);
  const [reportAction, setReportAction] = useState('warned');
  const [reportNote, setReportNote] = useState('');

  // Flagged Users
  const [flaggedUsers, setFlaggedUsers] = useState([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(({ data }) => setTotalAccounts(data.data?.totalAccounts ?? 0))
      .catch(() => setTotalAccounts(null));
  }, []);

  const loadTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'news') {
        return;
      } else if (activeTab === 'verifications') {
        const { data } = await adminService.getPendingVerifications();
        setVerifications(data.data || []);
      } else if (activeTab === 'reports') {
        const { data } = await adminService.getReports();
        setReports(data.data || []);
      } else if (activeTab === 'flagged') {
        const { data } = await adminService.getFlaggedUsers();
        setFlaggedUsers(data.data || []);
      } else if (activeTab === 'logs') {
        const { data } = await adminService.getAdminLogs();
        setAuditLogs(data.data || []);
      }
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Review Verification Action
  const handleReviewVerification = async (userId, status) => {
    try {
      await adminService.reviewVerification(userId, {
        status,
        reason: status === 'rejected' ? rejectReason : undefined,
      });
      toast.success(`Verification marked as ${status}`);
      setReviewModalOpen(false);
      setRejectReason('');
      setSelectedVerif(null);
      loadTabData();
    } catch {
      toast.error('Failed to process verification');
    }
  };

  const handleOpenVerificationDocument = async (userId) => {
    try {
      const response = await adminService.getVerificationDocument(userId);
      const url = URL.createObjectURL(response.data);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error('Could not open the verification document');
    }
  };

  // Review Report Action
  const handleReviewReport = async () => {
    if (!reportActionModal) return;
    try {
      await adminService.reviewReport(reportActionModal._id, {
        action: reportAction,
        adminNote: reportNote,
      });
      toast.success(`Report resolved with action: ${reportAction}`);
      setReportActionModal(null);
      setReportNote('');
      loadTabData();
    } catch {
      toast.error('Failed to resolve report');
    }
  };

  // Update Flagged User Status
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, { accountStatus: newStatus });
      toast.success(`User status changed to ${newStatus}`);
      loadTabData();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="p-2 rounded-full hover:bg-surface text-muted hover:text-heading transition-colors cursor-pointer"
            >
              <HiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-heading flex items-center gap-2">
                <HiShieldCheck className="text-success" /> Admin Control Center
              </h1>
              <p className="text-xs text-muted">Manage verifications, moderation reports, and platform integrity</p>
            </div>
          </div>
        </div>

        <Card className="flex items-center gap-4 border border-border bg-surface p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HiUserGroup size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total accounts</p>
            <p className="mt-1 text-3xl font-serif font-bold text-heading">
              {totalAccounts === null ? '—' : totalAccounts.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1.5 bg-surface rounded-2xl border border-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'news' ? 'bg-primary text-white shadow-warm-sm' : 'text-muted hover:text-heading'}`}
          >
            <HiNewspaper size={16} /> News
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verifications'
                ? 'bg-primary text-white shadow-warm-sm'
                : 'text-muted hover:text-heading'
            }`}
          >
            <HiShieldCheck size={16} /> Pending Verifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-primary text-white shadow-warm-sm'
                : 'text-muted hover:text-heading'
            }`}
          >
            <HiExclamationTriangle size={16} /> User Reports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flagged')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'flagged'
                ? 'bg-primary text-white shadow-warm-sm'
                : 'text-muted hover:text-heading'
            }`}
          >
            <HiUserGroup size={16} /> Flagged Accounts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-primary text-white shadow-warm-sm'
                : 'text-muted hover:text-heading'
            }`}
          >
            <HiClipboardDocumentList size={16} /> Audit Logs
          </button>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="space-y-3">
            <SkeletonLoader variant="card" count={4} />
          </div>
        ) : (
          <div>
            {/* ── VERIFICATIONS TAB ─────────────────────────────────── */}
            {activeTab === 'news' && <AdminNews />}
            {activeTab === 'verifications' && (
              <div>
                {verifications.length === 0 ? (
                  <EmptyState
                    icon={HiShieldCheck}
                    title="No pending verifications"
                    description="All user verification requests have been reviewed."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verifications.map((item) => (
                      <Card key={item._id} className="p-5 border border-border bg-surface space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-heading">{item.name}</h3>
                            <p className="text-xs text-muted">{item.email}</p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                              {item.caStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {item.verificationDocument && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => handleOpenVerificationDocument(item._id)}
                              className="flex min-h-11 items-center gap-1 text-xs font-semibold text-primary underline"
                            >
                              <HiDocumentMagnifyingGlass size={16} /> Open Document Proof
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                          <Button
                            size="sm"
                            variant="primary"
                            className="flex-1 justify-center bg-success hover:bg-success/90"
                            onClick={() => handleReviewVerification(item._id, 'verified')}
                          >
                            <HiCheck size={16} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 justify-center text-error border-error/50 hover:bg-error/10"
                            onClick={() => {
                              setSelectedVerif(item);
                              setReviewModalOpen(true);
                            }}
                          >
                            <HiXMark size={16} /> Reject
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── REPORTS TAB ───────────────────────────────────────── */}
            {activeTab === 'reports' && (
              <div>
                {reports.length === 0 ? (
                  <EmptyState
                    icon={HiExclamationTriangle}
                    title="No reports submitted"
                    description="Zero active moderation incidents reported."
                  />
                ) : (
                  <div className="space-y-3">
                    {reports.map((rep) => (
                      <Card key={rep._id} className="p-5 border border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-error/10 text-error">
                              {rep.reason || 'Report'}
                            </span>
                            <span className="text-xs text-muted">
                              Reported by {rep.reporter?.name || 'Member'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-heading">
                            Target: {rep.reportedUser?.name} ({rep.reportedUser?.email})
                          </p>
                          {rep.details && (
                            <p className="text-xs text-muted italic">&ldquo;{rep.details}&rdquo;</p>
                          )}
                          <p className="text-[11px] text-muted">
                            Status: <span className="font-medium text-heading">{rep.status}</span>
                            {rep.adminAction && ` • Action: ${rep.adminAction}`}
                          </p>
                        </div>

                        {rep.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setReportActionModal(rep)}
                          >
                            Review Report
                          </Button>
                        ) : (
                          <span className="text-xs text-success font-medium flex items-center gap-1">
                            <HiCheck size={16} /> Resolved
                          </span>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── FLAGGED ACCOUNTS TAB ──────────────────────────────── */}
            {activeTab === 'flagged' && (
              <div>
                {flaggedUsers.length === 0 ? (
                  <EmptyState
                    icon={HiUserGroup}
                    title="No flagged users"
                    description="No suspicious or excessively reported accounts currently flagged."
                  />
                ) : (
                  <div className="space-y-3">
                    {flaggedUsers.map((user) => (
                      <Card key={user._id} className="p-4 border border-border bg-surface flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-heading">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                          <p className="text-xs text-error font-medium mt-0.5">
                            Reports received: {user.reportCount || 0} • Status: {user.accountStatus}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.accountStatus !== 'banned' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-error border-error/50 hover:bg-error/10"
                              onClick={() => handleUpdateUserStatus(user._id, 'banned')}
                            >
                              <HiNoSymbol size={16} /> Ban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateUserStatus(user._id, 'active')}
                            >
                              Unban
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── AUDIT LOGS TAB ────────────────────────────────────── */}
            {activeTab === 'logs' && (
              <div>
                {auditLogs.length === 0 ? (
                  <EmptyState
                    icon={HiClipboardDocumentList}
                    title="No logs recorded"
                    description="Administrative action logs will show here."
                  />
                ) : (
                  <div className="divide-y divide-border bg-surface rounded-2xl border border-border overflow-hidden">
                    {auditLogs.map((log) => (
                      <div key={log._id} className="p-3.5 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-heading">{log.action}</p>
                          <p className="text-muted">Target: {log.target}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted">{log.admin?.name || 'Admin'}</p>
                          <p className="text-[10px] text-muted">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Rejection Reason */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Reject Verification"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              Please enter the reason for rejecting {selectedVerif?.name}&apos;s verification. They will be notified and can re-upload.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Document image is blurred or registration number mismatch"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-error hover:bg-error/90 text-white"
                onClick={() => handleReviewVerification(selectedVerif?._id, 'rejected')}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Review Report */}
        <Modal
          isOpen={!!reportActionModal}
          onClose={() => setReportActionModal(null)}
          title="Take Report Action"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                Moderation Action
              </label>
              <select
                value={reportAction}
                onChange={(e) => setReportAction(e.target.value)}
                className="w-full text-xs"
              >
                <option value="warned">Warn User (Informational)</option>
                <option value="suspended">Suspend Account Temporarily</option>
                <option value="banned">Ban User Permanently</option>
                <option value="dismissed">Dismiss Report (No Violation)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                Admin Note / Reason
              </label>
              <textarea
                rows={3}
                placeholder="Reason or explanation for this action..."
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportActionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleReviewReport}>
                Submit Action
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
