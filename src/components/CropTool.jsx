import React, { useState, useRef } from 'react';
import { Scissors, Crop, X } from 'lucide-react';
import FileUploader from './FileUploader';
import { downloadBlob } from '../utils/helpers';

const CropTool = () => {
    const [file, setFile] = useState(null);
    const [imgObj, setImgObj] = useState(null);
    const [selection, setSelection] = useState(null);

    const [dragMode, setDragMode] = useState(null);
    const [startPos, setStartPos] = useState(null);
    const [initialSelection, setInitialSelection] = useState(null);

    const imgRef = useRef(null);
    const containerRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        setFile(f);
        const img = new Image();
        img.onload = () => { setImgObj(img); setSelection(null); };
        img.src = URL.createObjectURL(f);
    };

    const getCoords = (e) => {
        const rect = imgRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        return { x, y };
    };

    const isInsideSelection = (x, y) => {
        if (!selection) return false;
        return x >= selection.x && x <= selection.x + selection.w &&
            y >= selection.y && y <= selection.y + selection.h;
    };

    const handleMouseDown = (e) => {
        if (!imgRef.current) return;
        const { x, y } = getCoords(e);
        setStartPos({ x, y });

        if (selection && isInsideSelection(x, y)) {
            setDragMode('move');
            setInitialSelection({ ...selection });
        } else {
            setDragMode('create');
            setSelection({ x, y, w: 0, h: 0 });
        }
    };

    const handleMouseMove = (e) => {
        if (!dragMode || !startPos) return;
        const { x, y } = getCoords(e);

        if (dragMode === 'create') {
            const newX = Math.min(x, startPos.x);
            const newY = Math.min(y, startPos.y);
            const newW = Math.abs(x - startPos.x);
            const newH = Math.abs(y - startPos.y);
            setSelection({ x: newX, y: newY, w: newW, h: newH });
        } else if (dragMode === 'move' && initialSelection) {
            const dx = x - startPos.x;
            const dy = y - startPos.y;

            let newX = initialSelection.x + dx;
            let newY = initialSelection.y + dy;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + initialSelection.w > 1) newX = 1 - initialSelection.w;
            if (newY + initialSelection.h > 1) newY = 1 - initialSelection.h;

            setSelection({ ...initialSelection, x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        setDragMode(null);
        setStartPos(null);
        setInitialSelection(null);
    };

    const setRatio = (ratioW, ratioH) => {
        if (!imgRef.current) return;
        if (ratioW === 0 && ratioH === 0) {
            setSelection({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
            return;
        }
        const aspect = ratioW / ratioH;
        let w = 0.5;
        let h = (w / aspect) * (imgRef.current.naturalWidth / imgRef.current.naturalHeight);

        if (h > 0.8) {
            h = 0.8;
            w = h * aspect * (imgRef.current.naturalHeight / imgRef.current.naturalWidth);
        }
        const x = (1 - w) / 2;
        const y = (1 - h) / 2;
        setSelection({ x, y, w, h });
    };

    const handleCrop = () => {
        if (!imgObj || !selection || selection.w === 0) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const pixelX = selection.x * imgObj.naturalWidth;
        const pixelY = selection.y * imgObj.naturalHeight;
        const pixelW = selection.w * imgObj.naturalWidth;
        const pixelH = selection.h * imgObj.naturalHeight;
        canvas.width = pixelW;
        canvas.height = pixelH;
        ctx.drawImage(imgObj, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
        canvas.toBlob(blob => downloadBlob(blob, `cropped_${file.name}`));
    };

    return (
        <div className="flex-1 flex h-full">
            {!imgObj ? (
                <FileUploader onFileSelect={handleFile} icon={Scissors} title="裁減圖片" />
            ) : (
                <>
                    <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative checkerboard-bg"
                        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}>
                        <div className="relative shadow-xl" ref={containerRef} style={{ maxHeight: '90%', maxWidth: '90%' }}>
                            <img ref={imgRef} src={imgObj.src} className="block max-w-full max-h-[80vh] pointer-events-auto select-none" draggable={false}
                                onMouseDown={handleMouseDown} style={{ cursor: 'crosshair' }}
                            />
                            {selection && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute bg-black/60" style={{ top: 0, left: 0, width: '100%', height: `${selection.y * 100}%` }}></div>
                                    <div className="absolute bg-black/60" style={{ bottom: 0, left: 0, width: '100%', height: `${(1 - (selection.y + selection.h)) * 100}%` }}></div>
                                    <div className="absolute bg-black/60" style={{ top: `${selection.y * 100}%`, left: 0, width: `${selection.x * 100}%`, height: `${selection.h * 100}%` }}></div>
                                    <div className="absolute bg-black/60" style={{ top: `${selection.y * 100}%`, right: 0, width: `${(1 - (selection.x + selection.w)) * 100}%`, height: `${selection.h * 100}%` }}></div>
                                    <div className="absolute border-2 border-primary-500 shadow-[0_0_0_1px_rgba(255,255,255,0.5)] pointer-events-auto cursor-move"
                                        style={{ left: `${selection.x * 100}%`, top: `${selection.y * 100}%`, width: `${selection.w * 100}%`, height: `${selection.h * 100}%` }}
                                        onMouseDown={handleMouseDown}>
                                        <div className="absolute inset-0 border-t border-b border-white/30 h-1/3 top-1/3 pointer-events-none"></div>
                                        <div className="absolute inset-0 border-l border-r border-white/30 w-1/3 left-1/3 pointer-events-none"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => { setImgObj(null); setFile(null); }} className="absolute top-4 left-4 bg-white p-2 rounded-full shadow hover:text-red-500 z-30"><X size={20} /></button>
                    </div>
                    <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col z-20 shadow-xl">
                        <h3 className="font-bold text-lg mb-6">裁減設定</h3>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700">快速比例</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setRatio(0, 0)} className="py-2 border rounded hover:bg-primary-50 text-xs border-primary-200 text-primary-700 font-bold">自由裁減</button>
                                <button onClick={() => setRatio(1, 1)} className="py-2 border rounded hover:bg-primary-50 text-xs">1:1 (方)</button>
                                <button onClick={() => setRatio(4, 3)} className="py-2 border rounded hover:bg-primary-50 text-xs">4:3</button>
                                <button onClick={() => setRatio(16, 9)} className="py-2 border rounded hover:bg-primary-50 text-xs">16:9</button>
                                <button onClick={() => setRatio(3, 4)} className="py-2 border rounded hover:bg-primary-50 text-xs">3:4</button>
                                <button onClick={() => setRatio(9, 16)} className="py-2 border rounded hover:bg-primary-50 text-xs">9:16</button>
                            </div>
                            <div className="text-xs text-slate-400 mt-2"><p>• 拖曳畫面：建立新選區</p><p>• 拖曳藍框：移動選區</p></div>
                            {selection && <div className="p-3 bg-slate-50 rounded text-xs text-slate-500 space-y-1"><div>W: {Math.round(selection.w * imgObj.naturalWidth)} px</div><div>H: {Math.round(selection.h * imgObj.naturalHeight)} px</div></div>}
                        </div>
                        <div className="mt-auto">
                            <button onClick={handleCrop} disabled={!selection || selection.w === 0} className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"><Crop size={18} /> 確認裁減</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CropTool;
