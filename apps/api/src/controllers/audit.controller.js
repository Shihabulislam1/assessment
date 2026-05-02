import * as auditService from '../services/audit.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const result = await auditService.listAuditLogs(req.params.workspaceId, req.query);
  res.json(result);
});

export const exportCsv = asyncHandler(async (req, res) => {
  const csv = await auditService.exportAuditLogsCsv(req.params.workspaceId, req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
  res.send(csv);
});