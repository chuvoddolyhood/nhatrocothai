import { useState } from 'react';
import { Dialog } from '@mui/material';
import { X, Camera, Trash2 } from 'lucide-react';

export function CccdImage({ url, label, onRetake, onDelete }) {
    const [open, setOpen] = useState(false);

    if (!url) return null;
    return (
        <>
            <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500">{label}</p>
                <div
                    onClick={() => setOpen(true)}
                    className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                >
                    <img
                        src={url}
                        alt={label}
                        className="w-full object-cover transition-transform hover:scale-105 duration-300"
                        style={{ maxHeight: 180 }}
                    />
                </div>
            </div>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { bgcolor: 'transparent', boxShadow: 'none', backgroundImage: 'none', m: 2 }
                    }
                }}
            >
                <div className="relative flex flex-col justify-center items-center outline-none gap-3">
                    {/* Close button */}
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-2 right-2 md:-top-4 md:-right-4 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>

                    {/* Image */}
                    <img
                        src={url}
                        alt={label}
                        className="max-w-full max-h-[80vh] rounded-2xl object-contain bg-black/40 shadow-2xl"
                    />

                    {/* Action bar below image */}
                    {(onRetake || onDelete) && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl">
                            {onRetake && (
                                <button
                                    onClick={() => { setOpen(false); onRetake(); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all duration-200 active:scale-95"
                                >
                                    <Camera size={16} />
                                    Chụp lại
                                </button>
                            )}
                            {onRetake && onDelete && (
                                <div className="w-px h-4 bg-white/25" />
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => { setOpen(false); onDelete(); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/70 hover:bg-red-500/90 text-white text-sm font-semibold transition-all duration-200 active:scale-95"
                                >
                                    <Trash2 size={16} />
                                    Xóa ảnh
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
}
