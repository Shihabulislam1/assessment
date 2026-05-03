import * as analyticsService from '../services/analytics.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  const result = await analyticsService.getSummary(req.params.workspaceId);
  res.json(result);
});

export const getChartData = asyncHandler(async (req, res) => {
  const [goalCompletion, statusDist, priorityDist] = await Promise.all([
    analyticsService.getGoalCompletionOverTime(req.params.workspaceId),
    analyticsService.getStatusDistribution(req.params.workspaceId),
    analyticsService.getPriorityDistribution(req.params.workspaceId)
  ]);

  res.json({
    goalCompletion,
    statusDistribution: statusDist,
    priorityDistribution: priorityDist
  });
});

export const exportCsv = asyncHandler(async (req, res) => {
  const { goals, items, members } = await analyticsService.getExportData(req.params.workspaceId);

  const sanitize = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return ['=', '+', '-', '@'].includes(str[0]) ? `'${str}` : str;
  };

  let csv = '--- GOALS ---\n';
  csv += 'Title,Status,Owner,Due Date,Milestones,Avg Progress\n';
  goals.forEach(g => {
    const avgProgress = g.milestones.length > 0 
      ? Math.round(g.milestones.reduce((acc, m) => acc + m.progress, 0) / g.milestones.length) + '%' 
      : '0%';
    csv += `"${sanitize(g.title)}",${sanitize(g.status)},"${sanitize(g.owner.name)}",${g.dueDate ? g.dueDate.toISOString() : 'N/A'},${g.milestones.length},${avgProgress}\n`;
  });

  csv += '\n--- ACTION ITEMS ---\n';
  csv += 'Title,Status,Priority,Assignee,Goal,Due Date\n';
  items.forEach(i => {
    csv += `"${sanitize(i.title)}",${sanitize(i.status)},${sanitize(i.priority)},"${sanitize(i.assignee?.name || 'Unassigned')}","${sanitize(i.goal?.title || 'None')}",${i.dueDate ? i.dueDate.toISOString() : 'N/A'}\n`;
  });

  csv += '\n--- MEMBERS ---\n';
  csv += 'Name,Email,Role,Joined At\n';
  members.forEach(m => {
    csv += `"${sanitize(m.user.name)}",${sanitize(m.user.email)},${sanitize(m.role)},${m.joinedAt.toISOString()}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="workspace-data-${req.params.workspaceId}.csv"`);
  res.send(csv);
});
