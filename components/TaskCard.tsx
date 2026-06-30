'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { useTaskStore } from '@/store/taskStore';
import { Edit2, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate, isOverdue } from '@/lib/utils';
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

  return (
    <div
      className={`
        glass-panel-light rounded-xl p-3 md:p-4 transition-all hover:bg-white/5 group
        ${task.isCompleted ? 'opacity-60' : ''}
        ${overdue && !task.isCompleted ? 'border-rose-500/20' : ''}
      `}
    >
      <div className="flex items-start gap-3">

        {/* Custom Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`
            mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all
            ${toggling ? 'opacity-50' : ''}
            ${task.isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-2 border-gray-500 hover:border-indigo-400'}
          `}
        >
          {task.isCompleted && <CheckCircle2 size={14} className="text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm md:text-base font-semibold truncate ${
              task.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.dueDate && (
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  overdue && !task.isCompleted ? 'text-rose-400' : 'text-gray-500'
                }`}
              >
                <Calendar size={11} />
                {formatDate(task.dueDate)}
                {overdue && !task.isCompleted && <AlertCircle size={11} />}
              </span>
            )}
            <PriorityBadge priority={task.priority} />
            <CategoryBadge name={task.category} />
          </div>
        </div>

        {/* Actions — visible on hover (desktop) or always on mobile */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
