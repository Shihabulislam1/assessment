import prisma from '../config/db.js';

/**
 * Gets a summary of workspace statistics
 */
export const getSummary = async (workspaceId) => {
  const now = new Date();
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - now.getDay());
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const [
    totalGoals,
    completedGoals,
    overdueGoals,
    itemsDoneThisWeek,
    totalMembers,
    activeItems
  ] = await Promise.all([
    prisma.goal.count({ where: { workspaceId } }),
    prisma.goal.count({ where: { workspaceId, status: 'COMPLETED' } }),
    prisma.goal.count({ 
      where: { 
        workspaceId, 
        status: { not: 'COMPLETED' }, 
        dueDate: { lt: now } 
      } 
    }),
    prisma.actionItem.count({
      where: { 
        workspaceId, 
        status: 'DONE', 
        updatedAt: { gte: startOfCurrentWeek } 
      },
    }),
    prisma.workspaceMember.count({ where: { workspaceId } }),
    prisma.actionItem.count({ 
      where: { 
        workspaceId, 
        status: { not: 'DONE' } 
      } 
    }),
  ]);

  return {
    totalGoals,
    completedGoals,
    overdueGoals,
    itemsDoneThisWeek,
    totalMembers,
    activeItems,
    completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
  };
};

/**
 * Gets goal completion counts aggregated by month for the last 6 months
 */
export const getGoalCompletionOverTime = async (workspaceId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const completedGoals = await prisma.goal.findMany({
    where: {
      workspaceId,
      status: 'COMPLETED',
      updatedAt: { gte: sixMonthsAgo }
    },
    select: { updatedAt: true },
    orderBy: { updatedAt: 'asc' }
  });

  // Initialize months map
  const monthsMap = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleString('default', { month: 'short' });
    monthsMap[monthKey] = 0;
  }

  // Aggregate
  completedGoals.forEach(goal => {
    const monthKey = goal.updatedAt.toLocaleString('default', { month: 'short' });
    if (monthsMap[monthKey] !== undefined) {
      monthsMap[monthKey]++;
    }
  });

  // Convert to array in chronological order
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleString('default', { month: 'short' });
    result.push({
      month: monthKey,
      completed: monthsMap[monthKey]
    });
  }

  return result;
};

/**
 * Gets distribution of goals by status
 */
export const getStatusDistribution = async (workspaceId) => {
  const stats = await prisma.goal.groupBy({
    by: ['status'],
    where: { workspaceId },
    _count: true
  });

  return stats.map(s => ({
    name: s.status.replace(/_/g, ' '),
    value: s._count
  }));
};

/**
 * Gets distribution of action items by priority
 */
export const getPriorityDistribution = async (workspaceId) => {
  const stats = await prisma.actionItem.groupBy({
    by: ['priority'],
    where: { workspaceId },
    _count: true
  });

  return stats.map(s => ({
    name: s.priority,
    value: s._count
  }));
};

/**
 * Gets workspace data for CSV export
 */
export const getExportData = async (workspaceId) => {
  const [goals, items, members] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId },
      include: { owner: { select: { name: true } }, milestones: true }
    }),
    prisma.actionItem.findMany({
      where: { workspaceId },
      include: { assignee: { select: { name: true } }, goal: { select: { title: true } } }
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } }
    })
  ]);

  return { goals, items, members };
};
