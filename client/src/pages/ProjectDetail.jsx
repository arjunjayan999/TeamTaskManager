import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProject, deleteProject } from '../lib/api';
import TaskList from '../components/TaskList';
import { Spinner } from "../components/ui/spinner";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

const load = async () => {
    try {
      const data = await getProject(id);
      setProject(data);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };
  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-gray-400">
        <Spinner /> Loading...
      </div>
    );
  }

  if (!project) return null;

  const isAdmin = user.role === 'ADMIN';
  const total = project.tasks.length;
  const done = project.tasks.filter(t => t.status === 'DONE').length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const priorityColor = {
    LOW: 'text-gray-400',
    MEDIUM: 'text-yellow-500',
    HIGH: 'text-red-500',
  }[project.priority];

  return (
    <div className="p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="text-xs text-gray-400 hover:text-gray-700 mb-4 block"
        >
          ← Back to projects
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium">{project.title}</h1>
            {project.description && (
              <p className="text-sm text-gray-400 mt-1">{project.description}</p>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="text-xs text-gray-400 hover:text-red-500 ml-4"
            >
              Delete project
            </button>
          )}
        </div>

        {/* Meta row */}
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span className={priorityColor}>{project.priority} priority</span>
          {project.dueDate && (
            <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
          )}
          <span>{project.members.map(m => m.user.username).join(', ')}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{done} of {total} tasks complete</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-1.5 bg-gray-900 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <TaskList
        project={project}
        isAdmin={isAdmin}
        onUpdate={load}
      />
    </div>
  );
}