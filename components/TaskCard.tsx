'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { useTaskStore } from '@/store/taskStore';
import { Edit2, Trash2, Calendar, Check } from 'lucide-react';
import { isOverdue } from '@/lib/utils';
import { updateTask, deleteTask } from '@/lib/api-client';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<Props> = ({ task, onEdit }) => {
  const { updateTask: storeUpdateTask, deleteTask: storeDeleteTask } = useTaskStore();
  const overdue = isOverdue(task.dueDate);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const updated = await updateTask(task.id, { isCompleted: !task.isCompleted });
      storeUpdateTask(task.id, updated);
    } catch (err) {
      console.error('Error toggling task:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      storeDeleteTask(task.id);
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Format date like "Oct 24, 2023"
  const formattedDate = task.dueDate ? new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(task.dueDate)) : null;

  return (
    <div
      className={`
        py-4 transition-all group flex items-start gap-4
        ${task.isCompleted ? 'opacity-70' : ''}
      `}
    >
      {/* Custom Checkbox (rounded-lg) */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`
          mt-1 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all
          ${toggling ? 'opacity-50' : ''}
          ${task.isCompleted
            ? 'bg-indigo-300 border-indigo-300 text-[#0F172A]' // checked state
            : 'border-2 border-white/20 hover:border-indigo-400 bg-transparent'}
        `}
      >
        {task.isCompleted && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-base font-bold truncate ${
            task.isCompleted ? 'line-through text-gray-500' : 'text-gray-100'
          }`}
        >
          {task.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          {task.dueDate && (
            <span
              className={`text-xs font-medium flex items-center gap-1.5 ${
                overdue && !task.isCompleted ? 'text-rose-400' : 'text-gray-400'
              }`}
            >
              <Calendar size={13} />
              {formattedDate}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
          {/* We keep CategoryBadge just in case, but it's optional */}
          <CategoryBadge name={task.category} />
        </div>
      </div>

      {/* Actions — visible on hover (desktop) or always on mobile */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
