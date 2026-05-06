import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Spinner } from "../components/ui/spinner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success('Signed in');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg border border-gray-200">
        <h1 className="text-xl font-medium mb-6">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white text-sm py-2 rounded hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Spinner className="text-white" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}