'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { useTaskStore } from '@/store/taskStore';
import { formatDate, isOverdue } from '@/lib/utils';
import { Check, Trash2, Edit2, AlertCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';

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
        bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition animate-fade-in
        border-l-4  ${
          task.isCompleted
            ? 'border-l-green-500 opacity-60'
            : 'border-l-blue-500'
        }
        ${overdue && !task.isCompleted ? 'ring-2 ring-red-300' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`
            mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition
            ${
              task.isCompleted
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-green-500'
            }
          `}
        >
          {task.isCompleted && <Check size={16} className="text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`
                  font-semibold text-lg break-words
                  ${task.isCompleted ? 'line-through text-gray-500' : ''}
                `}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-2 hover:bg-gray-100 rounded transition text-gray-600"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 hover:bg-red-50 rounded transition text-red-600"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <CategoryBadge name={task.category} />
            <PriorityBadge priority={task.priority} />

            {task.dueDate && (
              <span
                className={`text-xs font-medium ${
                  overdue && !task.isCompleted
                    ? 'text-red-600 font-semibold flex items-center gap-1'
                    : 'text-gray-600'
                }`}
              >
                {overdue && !task.isCompleted && <AlertCircle size={14} />}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
