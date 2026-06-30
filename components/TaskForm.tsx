'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '@/lib/types';
import { X } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Props {
  task?: Task;
  onSubmit: (data: TaskFormData) => void;
  onClose: () => void;
}

const TaskForm: React.FC<Props> = ({ task, onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          category: task.category,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        }
      : {
          priority: 'medium',
          category: 'general',
        },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0b1326] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all"
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white appearance-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white appearance-none"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="shopping">Shopping</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Due Date <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white transition-all [color-scheme:dark]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition font-semibold shadow-lg shadow-indigo-500/30"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
