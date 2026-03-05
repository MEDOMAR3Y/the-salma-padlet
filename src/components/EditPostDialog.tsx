import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bold, Italic, Underline, List } from 'lucide-react';
import { Post, usePosts } from '@/hooks/usePosts';
import { toast } from 'sonner';

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
  const textRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string) => {
    const ta = textRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePost.mutateAsync({
        id: post.id,
        content: content.trim() || null,
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
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-xl">تعديل المنشور</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('**', '**')}><Bold className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('*', '*')}><Italic className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('__', '__')}><Underline className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('\n- ', '')}><List className="h-4 w-4" /></Button>
          </div>
          <Textarea ref={textRef} value={content} onChange={e => setContent(e.target.value)} rows={4} className="resize-none" placeholder="محتوى المنشور..." />
          {(post.post_type === 'link') && (
            <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="رابط..." dir="ltr" />
          )}
          <div className="space-y-2">
            <Label>لون المنشور</Label>
            <div className="flex gap-2 flex-wrap">
              {POST_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-border'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ التعديلات'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
