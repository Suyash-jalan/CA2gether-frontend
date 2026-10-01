import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-4"
      >
        <span className="text-6xl font-serif font-bold text-primary">404</span>
        <h1 className="text-2xl font-serif font-bold text-heading">
          Page Not Balanced
        </h1>
        <p className="text-sm text-muted">
          Looks like this ledger account doesn&apos;t exist, or the entry has been reversed.
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={() => navigate('/discover')}>
            Return to Discovery
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
