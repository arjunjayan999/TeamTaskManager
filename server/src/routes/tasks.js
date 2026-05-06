import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router({ mergeParams: true }); // needed to access :projectId from parent route

router.use(authenticate);

// Helper — verify the requesting user can access this project at all
async function getProjectOrFail(projectId, userId, role, res) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return null;
  }

  const isOwner = project.createdById === userId;
  const isMember = project.members.some(m => m.userId === userId);

  if (!isOwner && !isMember) {
    res.status(403).json({ error: 'Access denied' });
    return null;
  }

  return project;
}

// GET /projects/:projectId/tasks
router.get('/', async (req, res) => {
  const project = await getProjectOrFail(
    req.params.projectId, req.user.userId, req.user.role, res
  );
  if (!project) return;

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: { completedBy: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /projects/:projectId/tasks — admin only
router.post('/', requireAdmin, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const project = await getProjectOrFail(
    req.params.projectId, req.user.userId, req.user.role, res
  );
  if (!project) return;

  // Admin must own this project
  if (project.createdById !== req.user.userId)
    return res.status(403).json({ error: 'Access denied' });

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: req.params.projectId,
      },
      include: { completedBy: { select: { id: true, username: true } } },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /projects/:projectId/tasks/:taskId
// Admin can update anything. Member can only update status.
router.patch('/:taskId', async (req, res) => {
  const project = await getProjectOrFail(
    req.params.projectId, req.user.userId, req.user.role, res
  );
  if (!project) return;

  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.projectId !== req.params.projectId)
      return res.status(400).json({ error: 'Task does not belong to this project' });

    const isOwner = project.createdById === req.user.userId;
    const { title, description, status } = req.body;

    // Members can only change status
    if (!isOwner && (title || description)) {
      return res.status(403).json({ error: 'Members can only update task status' });
    }

    // Work out completedById
    let completedById = task.completedById;
    if (status === 'DONE') {
      completedById = req.user.userId;
    } else if (status === 'TODO' || status === 'IN_PROGRESS') {
      completedById = null; // un-completing resets it
    }

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(isOwner && title && { title }),
        ...(isOwner && description !== undefined && { description }),
        ...(status && { status }),
        completedById,
      },
      include: { completedBy: { select: { id: true, username: true } } },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /projects/:projectId/tasks/:taskId — admin only
router.delete('/:taskId', requireAdmin, async (req, res) => {
  const project = await getProjectOrFail(
    req.params.projectId, req.user.userId, req.user.role, res
  );
  if (!project) return;

  if (project.createdById !== req.user.userId)
    return res.status(403).json({ error: 'Access denied' });

  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;