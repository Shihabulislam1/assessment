'use client';

import { useState } from 'react';
import { UserPlus, Mail, Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';

export function InviteMemberDialog({ workspaceId, onInviteSuccess }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await apiFetch(`/api/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setOpen(false);
      setEmail('');
      if (onInviteSuccess) onInviteSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
          <UserPlus className="size-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Invite to Team</DialogTitle>
          <DialogDescription>
            Send an invitation to join this workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-primary/20"
            />
            {error && <p className="text-xs text-destructive font-bold mt-1 ml-1">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Send Invitation <Send className="size-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
