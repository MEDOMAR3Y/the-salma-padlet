import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, ImagePlus, X } from 'lucide-react';
import { useBoards } from '@/hooks/useBoards';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ColorPicker from '@/components/ColorPicker';

export default function CreateBoardDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [layout, setLayout] = useState('wall');
  const [bgImage, setBgImage] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createBoard } = useBoards();
  const { user } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgImage(file);
      setBgPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('اكتب عنوان اللوحة'); return; }
    setLoading(true);
    try {
      let background_image: string | undefined;
      if (bgImage && user) {
        const ext = bgImage.name.split('.').pop();
        const path = `${user.id}/board-bg-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('post-files').upload(path, bgImage);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('post-files').getPublicUrl(path);
        background_image = data.publicUrl;
      }
      await createBoard.mutateAsync({ title: title.trim(), description: description.trim() || undefined, background_color: color, layout, ...(background_image ? { background_image } : {}) });
      toast.success('تم إنشاء اللوحة!');
      setOpen(false);
      setTitle(''); setDescription(''); setColor('#6366f1'); setLayout('wall'); setBgImage(null); setBgPreview(null);
    } catch {
      toast.error('حصل خطأ، حاول مرة ثانية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-5 w-5 ml-2" /> لوحة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-xl">إنشاء لوحة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="board-title">عنوان اللوحة</Label>
            <Input id="board-title" placeholder="مثلاً: أفكار المشروع" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="board-desc">الوصف (اختياري)</Label>
            <Textarea id="board-desc" placeholder="وصف مختصر للوحة..." value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>شكل العرض</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wall">حائط (Wall)</SelectItem>
                <SelectItem value="grid">شبكة (Grid)</SelectItem>
                <SelectItem value="column">أعمدة (Column)</SelectItem>
                <SelectItem value="map">خريطة ذهنية (Map)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>خلفية اللوحة (صورة - اختياري)</Label>
            {bgPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={bgPreview} alt="" className="w-full h-24 object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 left-1 h-6 w-6" onClick={() => { setBgImage(null); setBgPreview(null); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-sm">اختر صورة خلفية</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <ColorPicker color={color} onChange={setColor} label="لون الخلفية" />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading || createBoard.isPending}>
            {(loading || createBoard.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'أنشئ اللوحة'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
