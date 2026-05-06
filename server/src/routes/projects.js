import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        where: { createdById: req.user.userId },
        include: {
          members: { include: { user: { select: { id: true, username: true, email: true } } } },
          tasks: true,
        },
      });
    } else {
      projects = await prisma.project.findMany({
        where: { members: { some: { userId: req.user.userId } } },
        include: {
          members: { include: { user: { select: { id: true, username: true, email: true } } } },
          tasks: true,
        },
      });
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /projects/dashboard/stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Scope to projects this user can see
    const projectFilter = role === 'ADMIN'
      ? { createdById: userId }
      : { members: { some: { userId } } };

    const [total, completed, pending, overdue] = await Promise.all([
      prisma.task.count({
        where: { project: projectFilter },
      }),
      prisma.task.count({
        where: { project: projectFilter, status: 'DONE' },
      }),
      prisma.task.count({
        where: { project: projectFilter, status: { in: ['TODO', 'IN_PROGRESS'] } },
      }),
      prisma.task.count({
        where: {
          project: {
            ...projectFilter,
            dueDate: { lt: new Date() },
          },
          status: { not: 'DONE' },
        },
      }),
    ]);

    res.json({ total, completed, pending, overdue });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true } } } },
        tasks: { include: { completedBy: { select: { id: true, username: true } } } },
      },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isOwner = project.createdById === req.user.userId;
    const isMember = project.members.some(m => m.userId === req.user.userId);

    if (!isOwner && !isMember)
      return res.status(403).json({ error: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, description, dueDate, priority, assigneeIds } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority ?? 'MEDIUM',
        createdById: req.user.userId,
        members: {
          create: assigneeIds?.map(userId => ({ userId })) ?? [],
        },
      },
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true } } } },
        tasks: true,
      },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const { title, description, dueDate, priority, assigneeIds } = req.body;

  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.createdById !== req.user.userId)
      return res.status(403).json({ error: 'Access denied' });

    if (assigneeIds) {
      await prisma.projectMember.deleteMany({ where: { projectId: req.params.id } });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(priority && { priority }),
        ...(assigneeIds && {
          members: { create: assigneeIds.map(userId => ({ userId })) },
        }),
      },
      include: {
        members: { include: { user: { select: { id: true, username: true, email: true } } } },
        tasks: true,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.createdById !== req.user.userId)
      return res.status(403).json({ error: 'Access denied' });

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users/all', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;