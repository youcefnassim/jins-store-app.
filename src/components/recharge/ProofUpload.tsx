"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProofUploadProps {
  onBack: () => void;
  onSubmit: (file: File, transactionRef: string) => void;
  isSubmitting: boolean;
}

export function ProofUpload({ onBack, onSubmit, isSubmitting }: ProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    processFile(selected);
  };

  const processFile = (selected?: File) => {
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      processFile(selected);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    onSubmit(file, transactionRef);
  };

  return (
    <Card className="glass-card border-white/10 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <CardHeader>
        <CardTitle className="text-2xl text-white">Upload Payment Proof</CardTitle>
        <CardDescription className="text-muted-foreground">
          Please upload a screenshot or photo of your payment receipt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-xl transition-all duration-300 relative overflow-hidden group",
              preview 
                ? "border-primary/50 bg-black/40" 
                : isDragging
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 cursor-pointer"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <AnimatePresence mode="wait">
              {preview ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative aspect-video max-h-[300px] w-full flex items-center justify-center p-2"
                >
                  <img src={preview} alt="Payment proof preview" className="max-h-full max-w-full object-contain rounded-lg shadow-xl" />
                  
                  {/* File Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white/10 rounded-md shrink-0">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate">{file?.name}</p>
                        <p className="text-xs text-muted-foreground">{(file?.size! / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-4 right-4 rounded-full w-8 h-8 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:scale-110 transition-transform"
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                    isDragging ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-white mb-1">
                    {isDragging ? "Drop your screenshot here" : "Click or drag image to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WEBP up to 5MB</p>
                </motion.div>
              )}
            </AnimatePresence>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="ref" className="text-white/80">Transaction Reference (Optional)</Label>
            <Input 
              id="ref"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. TRX123456789" 
              className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-12 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting} className="text-white/70 hover:text-white hover:bg-white/5">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
            
            <Button 
              type="submit" 
              disabled={!file || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white h-12 px-8 min-w-[160px] rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 w-5 h-5" />
                  Submit Order
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
