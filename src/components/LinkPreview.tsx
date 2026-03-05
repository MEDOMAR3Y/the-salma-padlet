import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewData {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

function useLinkPreview(url: string) {
  return useQuery({
    queryKey: ['link-preview', url],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('link-preview', {
        body: { url },
      });
      if (error) throw error;
      return data as LinkPreviewData;
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

export default function LinkPreview({ url }: { url: string }) {
  const { data, isLoading } = useLinkPreview(url);

  if (isLoading) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm hover:underline mb-2 break-all">
        <ExternalLink className="h-4 w-4 shrink-0" /> {url}
      </a>
    );
  }

  if (!data?.title && !data?.image) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm hover:underline mb-2 break-all">
        <ExternalLink className="h-4 w-4 shrink-0" /> {url}
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border overflow-hidden hover:bg-muted/50 transition-colors mb-2">
      {data.image && (
        <img src={data.image} alt={data.title || ''} className="w-full max-h-48 object-cover" />
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {data.favicon && <img src={data.favicon} alt="" className="w-4 h-4" />}
          {data.siteName && <span className="text-xs text-muted-foreground">{data.siteName}</span>}
        </div>
        {data.title && <p className="text-sm font-medium text-foreground line-clamp-2">{data.title}</p>}
        {data.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{data.description}</p>}
      </div>
    </a>
  );
}
