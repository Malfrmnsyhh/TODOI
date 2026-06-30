'use client';

import React from 'react';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import { ListTodo } from 'lucide-react';

interface Props {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onEdit }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <ListTodo size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-500">No tasks yet</h3>
        <p className="text-gray-400 mt-1">Create your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="animate-slide-in">
          <TaskCard task={task} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
