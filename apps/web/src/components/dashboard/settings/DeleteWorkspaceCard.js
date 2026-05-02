import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';

export const DeleteWorkspaceCard = ({ workspaceId, workspaceName }) => {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmName !== workspaceName) return;
    
    setIsDeleting(true);
    try {
      await apiFetch(`/api/workspaces/${workspaceId}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/20 shadow-xl shadow-destructive/5 bg-destructive/5 backdrop-blur-sm rounded-3xl overflow-hidden border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-destructive font-black tracking-tight uppercase">Danger Zone</CardTitle>
            <CardDescription className="text-destructive/70 font-medium">Irreversible actions that affect your entire workspace.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/10">
          <p className="text-sm text-destructive font-bold mb-1">Permanently Delete Workspace</p>
          <p className="text-xs text-destructive/70 leading-relaxed font-medium">
            Once you delete a workspace, there is no going back. This will delete all goals, action items, announcements, and team memberships permanently.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-destructive/20 w-full sm:w-auto">
              <Trash2 className="size-4 mr-2" /> Delete Workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight uppercase text-destructive">Final Confirmation</DialogTitle>
              <DialogDescription className="text-base font-medium">
                This action <span className="font-bold underline">cannot be undone</span>. Please type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-destructive font-bold">{workspaceName}</span> below to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Type workspace name here"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="h-12 rounded-xl border-destructive/20 focus-visible:ring-destructive"
              />
            </div>
            <DialogFooter className="sm:justify-start gap-2">
              <Button
                variant="destructive"
                className="h-12 rounded-xl px-8 font-bold flex-1"
                disabled={confirmName !== workspaceName || isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </Button>
              <Button
                variant="ghost"
                className="h-12 rounded-xl px-4 font-bold"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
