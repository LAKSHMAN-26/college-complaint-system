import React from 'react';
import { STATUS_CONFIG } from '../utils/constants';

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    badge: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm border border-black/5 ${config.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
