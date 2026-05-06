import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getProjects, deleteProject } from '../lib/api';
import ProjectForm from '../components/ProjectForm';
import { Spinner } from "../components/ui/spinner";

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      load();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditTarget(null);
    load();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-gray-400">
        <Spinner /> Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Projects</h1>
        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            New project
          </button>
        )}
      </div>

      {showForm && (
        <ProjectForm
          initial={editTarget}
          onDone={handleFormDone}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}

      <div className="space-y-3">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            isAdmin={user.role === 'ADMIN'}
            onClick={() => navigate(`/projects/${project.id}`)}
            onEdit={() => { setEditTarget(project); setShowForm(true); }}
            onDelete={() => handleDelete(project.id)}
          />
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-gray-400">No projects yet.</p>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, isAdmin, onClick, onEdit, onDelete }) {
  const total = project.tasks.length;
  const done = project.tasks.filter(t => t.status === 'DONE').length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const priorityColor = { LOW: 'text-gray-400', MEDIUM: 'text-yellow-500', HIGH: 'text-red-500' }[project.priority];

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium">{project.title}</h2>
          {project.description && (
            <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 ml-4" onClick={e => e.stopPropagation()}>
          <span className={`text-xs font-medium ${priorityColor}`}>{project.priority}</span>
          {isAdmin && (
            <>
              <button onClick={onEdit} className="text-xs text-gray-400 hover:text-gray-700">Edit</button>
              <button onClick={onDelete} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
            </>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">{done}/{total} tasks</span>
          <span className="text-xs text-gray-400">{pct}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full">
          <div className="h-1 bg-gray-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {project.members.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {project.members.map(m => (
            <span key={m.userId} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {m.user.username}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}