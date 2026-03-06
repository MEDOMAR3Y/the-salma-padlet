import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Post, usePosts } from '@/hooks/usePosts';
import { toast } from 'sonner';
import RichTextEditor from '@/components/RichTextEditor';

const POST_COLORS = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7d7', '#e0e7ff'];

interface EditPostDialogProps {
  post: Post;
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPostDialog({ post, boardId, open, onOpenChange }: EditPostDialogProps) {
  const [content, setContent] = useState(post.content || '');
  const [linkUrl, setLinkUrl] = useState(post.link_url || '');
  const [color, setColor] = useState(post.color || POST_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { updatePost } = usePosts(boardId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      await updatePost.mutateAsync({
        id: post.id,
        content: textContent ? content : null,
        color,
        link_url: linkUrl.trim() || null,
      });
      toast.success('تم تعديل المنشور');
      onOpenChange(false);
    } catch {
      toast.error('حصل خطأ أثناء التعديل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-xl">تعديل المنشور</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="محتوى المنشور..."
          />
          {(post.post_type === 'link') && (
            <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="رابط..." dir="ltr" />
          )}
          <div className="space-y-2">
            <Label className="text-sm">لون المنشور</Label>
            <div className="flex gap-2 flex-wrap">
              {POST_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110 ring-2 ring-primary/30' : 'border-border hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ التعديلات'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
