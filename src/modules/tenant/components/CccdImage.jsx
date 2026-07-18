import { useState } from 'react';
import { Dialog } from '@mui/material';
import { X } from 'lucide-react';

export function CccdImage({ url, label }) {
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
                <div className="relative flex justify-center items-center outline-none">
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-2 right-2 md:-top-4 md:-right-4 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={url}
                        alt={label}
                        className="max-w-full max-h-[85vh] rounded-2xl object-contain bg-black/40 shadow-2xl"
                    />
                </div>
            </Dialog>
        </>
    );
}
