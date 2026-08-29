import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  Check,
  AlertCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { STATUS_CONFIG } from '../utils/constants';

const StatusTimeline = ({ history = [], currentStatus = '' }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'UNDER_REVIEW':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'CLOSED':
        return <Check className="w-4 h-4 text-slate-600" />;
      case 'REOPENED':
        return <RotateCcw className="w-4 h-4 text-orange-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        No status history available yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-0.5 before:bg-slate-200">
      {history.map((step, idx) => {
        const isLatest = idx === history.length - 1;
        const config = STATUS_CONFIG[step.status] || {};

        return (
          <div key={step._id || idx} className="relative group">
            {/* Timeline bullet */}
            <div
              className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 shadow-sm transition-all ${
                isLatest
                  ? 'border-indigo-600 ring-4 ring-indigo-100 scale-110'
                  : 'border-slate-300'
              }`}
            >
              {getStatusIcon(step.status)}
            </div>

            {/* Content card */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    config.badge || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {config.label || step.status}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatDate(step.createdAt)}
                </span>
              </div>

              {step.comment && (
                <p className="text-xs text-slate-700 font-normal mt-1 leading-relaxed">
                  {step.comment}
                </p>
              )}

              {step.changedBy && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Updated by:</span>
                  <span>{step.changedBy.name || 'System'}</span>
                  {step.changedBy.role && (
                    <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-600">
                      {step.changedBy.role}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
