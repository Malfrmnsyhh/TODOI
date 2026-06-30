import React from 'react';
import { Priority } from '@/lib/types';

interface Props {
  priority: Priority;
}

const PriorityBadge: React.FC<Props> = ({ priority}) => {
  const styles = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[priority]}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default PriorityBadge;