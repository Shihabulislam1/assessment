import { useState, useEffect } from 'react';
import { Layout, Palette, Save, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { AvatarUpload } from './AvatarUpload';
import { WorkspaceImageUpload } from './WorkspaceImageUpload';

export const GeneralSettingsForm = ({ workspaceId, initialData, onUpdate }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    accentColor: initialData?.accentColor || '#6366f1',
  });
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        accentColor: initialData.accentColor || '#6366f1',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/workspaces/${workspaceId}`, { 
        method: 'PUT', 
        body: JSON.stringify(form) 
      });
      if (onUpdate) await onUpdate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Layout className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl">General Information</CardTitle>
            <CardDescription>Update your workspace name and identity.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start pb-6 border-b border-muted-foreground/5">
          <AvatarUpload />
          <div className="flex-1 space-y-1">
            <h3 className="font-bold">Your Profile</h3>
            <p className="text-sm text-muted-foreground">This is your personal avatar shown across all workspaces.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Workspace Name</label>
            <Input
              className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Engineering Team"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Description</label>
            <Textarea
              className="min-h-[100px] rounded-xl bg-muted/30 border-muted-foreground/10 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Explain the purpose of this workspace..."
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold ml-1">
              <Palette className="size-4 text-primary" />
              <span>Workspace Identity</span>
            </div>
            
            <WorkspaceImageUpload 
              workspaceId={workspaceId} 
              currentImageUrl={initialData?.imageUrl} 
              onUpdate={onUpdate}
            />

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
              <input
                type="color"
                className="size-12 rounded-lg border-2 border-background cursor-pointer"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-muted-foreground">Accent Color</span>
                <span className="font-mono text-sm font-bold">{form.accentColor}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting} className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20">
              {isSubmitting ? 'Saving...' : (
                <span className="flex items-center gap-2">
                  <Save className="size-4" /> Save Changes
                </span>
              )}
            </Button>
            {saved && (
              <div className="flex items-center gap-2 text-green-500 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="size-4" />
                Changes saved successfully
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
