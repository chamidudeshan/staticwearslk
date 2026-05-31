'use client';

import { useRef, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedImage {
  /** temp id for new images (no DB id yet) */
  key: string;
  /** DB id — only set for images already saved */
  dbId?: string;
  url: string;
  is_main: boolean;
}

interface Props {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  label?: string;
  single?: boolean;
}

export function ImageUploader({ images, onChange, maxImages = 8, label = 'Photos', single = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const allowed = single ? 1 : Math.min(files.length, maxImages - images.length);
    if (allowed === 0) return;

    setUploading(true);
    const results: UploadedImage[] = [];

    for (let i = 0; i < allowed; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      const fd = new FormData();
      fd.append('file', file);

      let res: Response;
      let data: { url?: string; error?: string };
      try {
        res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        data = await res.json();
      } catch (err) {
        toast.error(`Network error: ${err instanceof Error ? err.message : 'unknown'}`);
        continue;
      }
      if (!res.ok) {
        toast.error(`Upload failed: ${data.error ?? res.statusText}`);
        continue;
      }
      if (!data.url) {
        toast.error('Upload succeeded but no URL returned');
        continue;
      }
      results.push({
        key: `new-${Date.now()}-${i}`,
        url: data.url,
        is_main: images.length === 0 && results.length === 0,
      });
    }

    if (results.length > 0) {
      const next = single ? results : [...images, ...results];
      if (single && next.length > 0) next[0].is_main = true;
      onChange(next);
    }
    setUploading(false);
  }

  function setMain(key: string) {
    onChange(images.map((img) => ({ ...img, is_main: img.key === key })));
  }

  function remove(key: string) {
    const next = images.filter((img) => img.key !== key);
    if (next.length > 0 && !next.some((img) => img.is_main)) {
      next[0].is_main = true;
    }
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <label className="font-mono text-xs uppercase tracking-widest text-[#555]">{label}</label>

      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div
            key={img.key}
            className={`relative w-24 h-24 border-2 transition-colors ${
              img.is_main ? 'border-[#ff6b35]' : 'border-[#1e1e28]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-full object-cover" />

            {img.is_main && (
              <div className="absolute top-1 left-1 bg-[#ff6b35] rounded-full p-0.5">
                <Star size={8} className="text-black fill-black" />
              </div>
            )}

            <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/50 flex items-center justify-center gap-1.5 transition-opacity">
              {!img.is_main && !single && (
                <button
                  type="button"
                  onClick={() => setMain(img.key)}
                  title="Set as main"
                  className="bg-[#ff6b35] text-black rounded-full p-1 hover:bg-[#e8ff59] transition-colors"
                >
                  <Star size={10} />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(img.key)}
                title="Remove"
                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        ))}

        {(single ? images.length === 0 : images.length < maxImages) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed border-[#1e1e28] hover:border-[#ff6b35] transition-colors flex flex-col items-center justify-center gap-1 text-[#333] hover:text-[#ff6b35] disabled:opacity-50"
          >
            <Upload size={16} />
            <span className="font-mono text-[9px] uppercase tracking-widest">
              {uploading ? 'Uploading...' : 'Add'}
            </span>
          </button>
        )}
      </div>

      {!single && images.length > 0 && (
        <p className="font-mono text-[10px] text-[#333]">
          Orange border = main photo. Hover an image to change.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
