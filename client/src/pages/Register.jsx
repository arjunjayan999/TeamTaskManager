import { useState } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';
import { Spinner } from "../components/ui/spinner";

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success(`User "${form.username}" created successfully.`);
      setForm({ email: '', username: '', password: '', role: 'MEMBER' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-sm mx-auto">
      <h1 className="text-xl font-medium mb-1">Add user</h1>
      <p className="text-sm text-gray-400 mb-6">Create a new account for a team member.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white text-sm py-2 rounded hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-60"
        >
            {loading && <Spinner className="text-white" />}
          Create user
        </button>
      </form>
    </div>
  );
}