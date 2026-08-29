import React from 'react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  subtitle,
  onClick,
  active = false,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      ring: 'ring-indigo-500',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-200',
      ring: 'ring-amber-500',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      border: 'border-blue-200',
      ring: 'ring-blue-500',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600',
      border: 'border-purple-200',
      ring: 'ring-purple-500',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      ring: 'ring-emerald-500',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-200',
      ring: 'ring-rose-500',
    },
    slate: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-600',
      border: 'border-slate-200',
      ring: 'ring-slate-500',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${
        active
          ? `ring-2 ${scheme.ring} border-transparent shadow-md`
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-medium mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl ${scheme.bg} ${scheme.text} flex items-center justify-center flex-shrink-0 shadow-inner`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
