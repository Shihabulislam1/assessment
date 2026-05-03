-- DropIndex
DROP INDEX "refresh_tokens_tokenHash_idx";

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE INDEX "action_items_priority_idx" ON "action_items"("priority");

-- CreateIndex
CREATE INDEX "action_items_goalId_idx" ON "action_items"("goalId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
