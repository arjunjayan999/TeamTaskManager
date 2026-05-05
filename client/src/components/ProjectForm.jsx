import { useEffect, useState } from 'react';
import { getAllUsers, createProject, updateProject } from '../lib/api';

export default function ProjectForm({ initial, onDone, onCancel }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
    priority: initial?.priority ?? 'MEDIUM',
    assigneeIds: initial?.members?.map(m => m.userId) ?? [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const toggleAssignee = (id) => {
    setForm(f => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id)
        ? f.assigneeIds.filter(x => x !== id)
        : [...f.assigneeIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (initial) {
        await updateProject(initial.id, form);
      } else {
        await createProject(form);
      }
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-white">
      <h2 className="text-sm font-medium mb-4">{initial ? 'Edit project' : 'New project'}</h2>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
        />
        <div className="flex gap-3">
          <input
            type="date"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <select
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value })}
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
          </select>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">Assign members</p>
          <div className="flex flex-wrap gap-2">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleAssignee(u.id)}
                className={`text-xs px-3 py-1 rounded border transition-colors ${
                  form.assigneeIds.includes(u.id)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            {initial ? 'Save changes' : 'Create project'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-400 px-4 py-2 rounded hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}