import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
  onClear: () => void;
}

const ImageUpload = ({ onImageSelect, preview, onClear }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 1024;
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const compressed = await compressImage(file);
    onImageSelect(file, compressed);
  }, [onImageSelect, compressImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (preview) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-border bg-card">
        <img src={preview} alt="Reference" className="w-full max-h-[400px] object-contain bg-background" />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
        isDragging
          ? "border-primary bg-primary/5 glow-primary"
          : "border-border hover:border-primary/50 hover:bg-card/50"
      }`}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-2xl bg-primary/10 text-primary">
          {isDragging ? <ImageIcon className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
        </div>
        <div>
          <p className="text-foreground font-semibold text-lg">
            {isDragging ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para enviar"}
          </p>
          <p className="text-muted-foreground text-sm mt-1">PNG, JPG, WEBP — até 20MB</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
