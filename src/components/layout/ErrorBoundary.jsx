import { Component } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-[20px] p-8 max-w-md w-full text-center border border-border shadow-[0_4px_16px_rgba(217,105,74,0.1)]"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
              className="text-6xl mb-4"
            >
              😵
            </motion.div>
            <h2 className="font-serif text-2xl text-heading mb-2">
              Something went wrong
            </h2>
            <p className="text-muted text-sm mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Reload Page
            </Button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
