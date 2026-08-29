import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapPin, Calendar, Building2, User, ArrowRight, Paperclip, MessageSquare } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ComplaintCard = ({ complaint, basePath = '/student/complaints' }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            {complaint.complaintId}
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title */}
        <Link
          to={`${basePath}/${complaint._id}`}
          className="block group-hover:text-indigo-600 transition-colors"
        >
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
            {complaint.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Category */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 bg-slate-100 font-medium text-slate-700 rounded-md text-[11px]">
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[180px]">{complaint.location}</span>
          </div>

          {complaint.department && (
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{complaint.department.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(complaint.createdAt)}</span>
        </div>

        <Link
          to={`${basePath}/${complaint._id}`}
          className="inline-flex items-center gap-1 font-bold text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
