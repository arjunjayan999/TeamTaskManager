import { useState } from 'react';
import { toast } from 'sonner';
import { createTask, updateTask, deleteTask } from '../lib/api';
import { Spinner } from "../components/ui/spinner";

export default function TaskList({ project, isAdmin, onUpdate }) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await createTask(project.id, { title: newTitle, description: newDesc });
      toast.success('Task created');
      setNewTitle('');
      setNewDesc('');
      setShowForm(false);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await updateTask(project.id, task.id, { status });
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(project.id, taskId);
      toast.success('Task deleted');
      onUpdate();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const groups = {
    TODO: project.tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: project.tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: project.tasks.filter(t => t.status === 'DONE'),
  };

  const statusLabel = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">Tasks</h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700"
          >
            {showForm ? 'Cancel' : 'Add task'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 border border-gray-200 rounded-lg p-4 space-y-2">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <input
            placeholder="Task title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <input
            placeholder="Description (optional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            type="submit"

            disabled={creating}
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded hover:bg-gray-700"
          > {creating && <Spinner className="text-white" />}
            Create
          </button>
        </form>
      )}

      {/* Task groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([status, tasks]) => (
          <div key={status}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              {statusLabel[status]} · {tasks.length}
            </p>
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-gray-300 pl-1">None</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task, isAdmin, onStatusChange, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-start justify-between gap-4">

        {/* Left: title + description */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.status === 'DONE' ? 'line-through text-gray-300' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Right: status selector + delete */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={task.status}
            onChange={e => onStatusChange(task, e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-gray-400 bg-white"
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
          {isAdmin && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs text-gray-300 hover:text-red-400"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Completed by — shown bottom-right when done */}
      {task.status === 'DONE' && task.completedBy && (
        <p className="text-xs text-gray-300 text-right mt-2">
          completed by {task.completedBy.username}
        </p>
      )}
    </div>
  );
}