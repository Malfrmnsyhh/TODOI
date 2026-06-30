import React from 'react';
import { getCategoryColor } from '@/lib/utils';

interface Props {
  name: string;
  color?: string;
}

const CategoryBadge: React.FC<Props> = ({ name, color = 'blue' }) => {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getCategoryColor(color)}`}>
      {name}
    </span>
  );
};

export default CategoryBadge;