import React from 'react';
import { Priority } from '@/lib/types';

interface Props {
  priority: Priority;
}

const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const styles = {
    high: 'bg-rose-500/10 text-rose-400',
    medium: 'bg-orange-500/10 text-orange-400',
    low: 'bg-indigo-500/10 text-indigo-400',
  };

  const labels = {
    high: 'HIGH PRIORITY',
    medium: 'MEDIUM',
    low: 'LOW',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  );
};

export default PriorityBadge;