import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Image, FileUp, Bold, Italic, Underline, List, X, Video } from 'lucide-react';
import { usePosts, uploadPostFile } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { isVideoUrl } from '@/lib/videoEmbed';
import { toast } from 'sonner';

const POST_COLORS = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7d7', '#e0e7ff'];

interface CreatePostDialogProps {
  boardId: string;
  trigger?: React.ReactNode;
}

function useTextFormat(contentRef: React.RefObject<HTMLTextAreaElement>, content: string, setContent: (v: string) => void) {
  const insertFormat = useCallback((prefix: string, suffix: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    
    // Check if already formatted - toggle off
    const before = content.substring(Math.max(0, start - prefix.length), start);
    const after = content.substring(end, end + suffix.length);
    if (before === prefix && after === suffix) {
      const newContent = content.substring(0, start - prefix.length) + selected + content.substring(end + suffix.length);
      setContent(newContent);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start - prefix.length, end - prefix.length);
      }, 0);
      return;
    }
    
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  }, [content, setContent, contentRef]);

  return insertFormat;
}

function renderPreview(text: string) {
  if (!text.trim()) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let formatted = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<u>$1</u>');
    if (line.startsWith('- ')) {
      formatted = `<span class="inline-flex gap-1">•&nbsp;${formatted.substring(2)}</span>`;
    }
    return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="block leading-relaxed" />;
  });
}

export default function CreatePostDialog({ boardId, trigger }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [color, setColor] = useState(POST_COLORS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'file' | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { createPost } = usePosts(boardId);
  const { user } = useAuth();
  const textRef = useRef<HTMLTextAreaElement>(null!);

  const insertFormat = useTextFormat(textRef, content, setContent);

  const reset = () => {
    setContent('');
    setLinkUrl('');
    setColor(POST_COLORS[0]);
    setFile(null);
    setFileType(null);
    setShowLinkInput(false);
    setShowPreview(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLink = linkUrl.trim();
    const normalizedLink = trimmedLink
      ? (/^https?:\/\//i.test(trimmedLink) ? trimmedLink : `https://${trimmedLink}`)
      : '';

    if (!content.trim() && !file && !normalizedLink) {
      toast.error('أضف محتوى للمنشور');
      return;
    }

    setLoading(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (file && user) {
        fileUrl = await uploadPostFile(file, user.id);
        fileName = file.name;
      }

      const postType = file
        ? (fileType === 'image' ? 'image' : 'file')
        : normalizedLink
          ? 'link'
          : 'text';

      await createPost.mutateAsync({
        board_id: boardId,
        content: content.trim() || null,
        post_type: postType as any,
        color,
        link_url: normalizedLink || null,
        file_url: fileUrl ?? null,
        file_name: fileName ?? null,
      });

      toast.success('تم إضافة المنشور!');
      setOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.message || 'حصل خطأ أثناء النشر');
    } finally {
      setLoading(false);
    }
  };

  const hasFormatting = /\*\*|__|^\- /m.test(content);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-5 w-5" /> إضافة منشور
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-['Space_Grotesk'] text-xl">إضافة منشور جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('**', '**')} title="عريض">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('*', '*')} title="مائل">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('__', '__')} title="تحته خط">
              <Underline className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertFormat('\n- ', '')} title="قائمة">
              <List className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            {hasFormatting && (
              <Button 
                type="button" 
                variant={showPreview ? "secondary" : "ghost"} 
                size="sm" 
                className="h-7 text-xs px-2"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'تحرير' : 'معاينة'}
              </Button>
            )}
          </div>

          {/* Text area or preview */}
          {showPreview ? (
            <div 
              className="min-h-[100px] p-3 rounded-md border border-border bg-card text-sm"
              style={{ backgroundColor: color === '#ffffff' ? 'hsl(var(--card))' : color }}
            >
              {renderPreview(content)}
            </div>
          ) : (
            <textarea
              ref={textRef}
              placeholder="اكتب محتوى المنشور... حدد نص واضغط B للعريض"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              onKeyDown={e => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') { e.preventDefault(); insertFormat('**', '**'); }
                  if (e.key === 'i') { e.preventDefault(); insertFormat('*', '*'); }
                  if (e.key === 'u') { e.preventDefault(); insertFormat('__', '__'); }
                }
              }}
            />
          )}

          {/* Attachments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-sm text-muted-foreground">أضف:</Label>
              <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" className="gap-1 h-8" asChild>
                  <span><Image className="h-3.5 w-3.5" /> صورة</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setFileType('image'); }} />
              </label>
              <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" className="gap-1 h-8" asChild>
                  <span><FileUp className="h-3.5 w-3.5" /> ملف</span>
                </Button>
                <input type="file" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setFileType('file'); }} />
              </label>
              <Button type="button" variant="outline" size="sm" className="gap-1 h-8" onClick={() => setShowLinkInput(!showLinkInput)}>
                <Video className="h-3.5 w-3.5" /> رابط / فيديو
              </Button>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                {fileType === 'image' ? <Image className="h-4 w-4 text-primary" /> : <FileUp className="h-4 w-4 text-primary" />}
                <span className="flex-1 truncate">{file.name}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFile(null); setFileType(null); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {showLinkInput && (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="youtube.com/watch?v=... أو أي رابط"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  dir="ltr"
                  className="flex-1 h-9"
                />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setShowLinkInput(false); setLinkUrl(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {linkUrl && isVideoUrl(/^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`) && (
              <p className="text-xs text-primary">✓ سيتم تضمين الفيديو تلقائياً</p>
            )}
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-sm">لون المنشور</Label>
            <div className="flex gap-2 flex-wrap">
              {POST_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110 ring-2 ring-primary/30' : 'border-border hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'نشر'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
