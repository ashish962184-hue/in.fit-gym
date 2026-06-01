import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader } from "lucide-react";
import { supabase } from "../supabaseClient";

/**
 * ImageUpload — Supabase Storage uploader for Admin CMS
 *
 * Props:
 *   bucket      {string}   Supabase Storage bucket name (default: "gym-images")
 *   folder      {string}   Sub-folder path inside bucket (e.g. "trainers", "gallery")
 *   currentUrl  {string}   Currently saved image URL (shown as preview)
 *   onUpload    {function} Called with the new public URL after successful upload
 *   label       {string}   Field label text
 *   accept      {string}   Accepted MIME types (default: "image/*")
 *   maxSizeMb   {number}   Max file size in MB (default: 5)
 */
export default function ImageUpload({
  bucket = "gym-images",
  folder = "general",
  currentUrl = "",
  onUpload,
  label = "Image",
  accept = "image/*",
  maxSizeMb = 5,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMb}MB.`);
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setUploading(true);

    try {
      // Build a unique file path
      const ext = file.name.split(".").pop().toLowerCase();
      const timestamp = Date.now();
      const safeName = file.name
        .replace(/[^a-z0-9.]/gi, "_")
        .toLowerCase()
        .slice(0, 40);
      const filePath = `${folder}/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
    } catch (err) {
      console.error("Image upload error:", err);
      if (err.message?.includes("row-level security")) {
        setError("Upload failed: You must be logged in as Admin to upload images.");
      } else if (err.message?.includes("Bucket not found")) {
        setError('Upload failed: Storage bucket "gym-images" not found. Run db_patch.sql first.');
      } else {
        setError("Upload failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearImage = () => {
    setPreviewUrl("");
    onUpload("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
        {label}
      </label>

      {/* Preview Area */}
      <div className="relative w-full h-36 bg-[#0B0B0C] border border-white/10 rounded-sm overflow-hidden group">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setPreviewUrl("")}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-[#E50914] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer hover:bg-white hover:text-black transition-all"
              >
                <Upload className="w-3 h-3" /> Replace
              </button>
              <button
                type="button"
                onClick={handleClearImage}
                disabled={uploading}
                className="bg-black/80 border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer hover:border-red-500 hover:text-red-400 transition-all"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-300 hover:bg-white/3 transition-all cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader className="w-6 h-6 animate-spin text-[#E50914]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#E50914]">
                  UPLOADING...
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="w-7 h-7" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Click to Upload Image
                </span>
                <span className="text-[8px] text-zinc-600">
                  Max {maxSizeMb}MB — JPG, PNG, WebP
                </span>
              </>
            )}
          </button>
        )}

        {/* Upload progress overlay for existing previews */}
        {uploading && previewUrl && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
            <Loader className="w-6 h-6 animate-spin text-[#E50914]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">
              UPLOADING...
            </span>
          </div>
        )}
      </div>

      {/* Action buttons when image exists */}
      {previewUrl && !uploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-[#E50914] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Upload className="w-3 h-3" /> Upload New Image
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[9px] text-red-400 font-medium leading-relaxed bg-red-950/20 border border-red-900/30 rounded-sm px-2 py-1.5">
          ⚠ {error}
        </p>
      )}

      {/* Current URL display (read-only, for reference) */}
      {previewUrl && (
        <p className="text-[8px] text-zinc-600 truncate font-mono">
          {previewUrl}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
