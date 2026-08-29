import React from 'react';
import { PRIORITY_CONFIG } from '../utils/constants';
import { AlertCircle, AlertTriangle, Info, Flame } from 'lucide-react';

const PriorityBadge = ({ priority, showIcon = true, className = '' }) => {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority || 'Medium',
    badge: 'bg-slate-100 text-slate-700',
  };

  const renderIcon = () => {
    switch (priority) {
      case 'CRITICAL':
        return <Flame className="w-3 h-3 text-rose-600 animate-bounce" />;
      case 'HIGH':
        return <AlertTriangle className="w-3 h-3 text-amber-600" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3 h-3 text-blue-600" />;
      case 'LOW':
      default:
        return <Info className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${config.badge} ${className}`}
    >
      {showIcon && renderIcon()}
      {config.label}
    </span>
  );
};

export default PriorityBadge;
