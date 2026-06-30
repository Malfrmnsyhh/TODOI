'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { useTaskStore } from '@/store/taskStore';
import { Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { formatDate, isOverdue } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<Props> = ({ task, onEdit }) => {
  const { toggleTask, deleteTask } = useTaskStore();
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      className={`
        glass-panel-light rounded-xl p-4 transition-all hover:bg-white/5 group
        ${task.isCompleted ? 'opacity-50 grayscale-[50%]' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        
        {/* Custom Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`
            mt-1 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all
            ${task.isCompleted 
              ? 'bg-indigo-500 border-indigo-500' 
              : 'border-2 border-gray-500 hover:border-indigo-400'}
          `}
        >
          {task.isCompleted && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold truncate ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {task.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {task.dueDate && (
              <span className={`text-xs font-medium flex items-center gap-1 ${overdue && !task.isCompleted ? 'text-red-400' : 'text-gray-500'}`}>
                <Calendar size={12} />
                {formatDate(task.dueDate)}
                {overdue && !task.isCompleted && <AlertCircle size={12} />}
              </span>
            )}
            <PriorityBadge priority={task.priority} />
            <CategoryBadge name={task.category} />
          </div>
        </div>

        {/* Actions (Visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/10 rounded-md transition"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-md transition"
          >
            <Trash2 size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TaskCard;
