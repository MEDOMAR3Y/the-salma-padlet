import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const textRef = useRef<HTMLTextAreaElement>(null!);

  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = textRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);

    const before = content.substring(Math.max(0, start - prefix.length), start);
    const after = content.substring(end, end + suffix.length);
    if (before === prefix && after === suffix) {
      const newContent = content.substring(0, start - prefix.length) + selected + content.substring(end + suffix.length);
      setContent(newContent);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start - prefix.length, end - prefix.length); }, 0);
      return;
    }

    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
  }, [content]);

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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
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
          <textarea
            ref={textRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            placeholder="محتوى المنشور..."
            onKeyDown={e => {
              if (e.ctrlKey || e.metaKey) {
                if (e.key === 'b') { e.preventDefault(); insertFormat('**', '**'); }
                if (e.key === 'i') { e.preventDefault(); insertFormat('*', '*'); }
                if (e.key === 'u') { e.preventDefault(); insertFormat('__', '__'); }
              }
            }}
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
