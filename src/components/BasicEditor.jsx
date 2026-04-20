import React, { useState, useEffect, useRef } from 'react';
import { Scaling, AlertTriangle, Link as LinkIcon, Unlock, Download } from 'lucide-react';
import FileUploader from './FileUploader';
import { downloadBlob, formatBytes } from '../utils/helpers';

const BasicEditor = () => {
    const [file, setFile] = useState(null);
    const [imgObj, setImgObj] = useState(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [ratio, setRatio] = useState(1);
    const [quality, setQuality] = useState(0.8);
    const [lockRatio, setLockRatio] = useState(true);
    const [resizeMode, setResizeMode] = useState('contain');
    const [outFormat, setOutFormat] = useState('original');
    const [projectedSize, setProjectedSize] = useState(0);
    const canvasRef = useRef(null);

    const handleFile = (f) => {
        if(!f) return;
        setFile(f);
        const img = new Image();
        img.onload = () => { setImgObj(img); setWidth(img.width); setHeight(img.height); setRatio(img.width/img.height); };
        img.src = URL.createObjectURL(f);
    };

    const handleChange = (val, type) => {
        const v = Number(val);
        if(type==='w') { setWidth(v); if(lockRatio) setHeight(Math.round(v/ratio)); }
        else { setHeight(v); if(lockRatio) setWidth(Math.round(v*ratio)); }
    };

    useEffect(()=>{
        if(!imgObj || !canvasRef.current) return;
        const timer = setTimeout(()=>{
            const cvs = canvasRef.current;
            const ctx = cvs.getContext('2d');
            cvs.width = width; cvs.height = height;
            ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
            
            ctx.clearRect(0, 0, width, height);

            const targetFormat = outFormat === 'original' ? file.type : outFormat;
            
            if (targetFormat === 'image/jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
            }

            if (resizeMode === 'stretch' || lockRatio) {
                ctx.drawImage(imgObj, 0, 0, width, height);
            } else if (resizeMode === 'contain') {
                const scale = Math.min(width / imgObj.width, height / imgObj.height);
                const drawW = imgObj.width * scale;
                const drawH = imgObj.height * scale;
                const x = (width - drawW) / 2;
                const y = (height - drawH) / 2;
                ctx.drawImage(imgObj, x, y, drawW, drawH);
            } else if (resizeMode === 'cover') {
                const scale = Math.max(width / imgObj.width, height / imgObj.height);
                const drawW = imgObj.width * scale;
                const drawH = imgObj.height * scale;
                const x = (width - drawW) / 2;
                const y = (height - drawH) / 2;
                ctx.drawImage(imgObj, x, y, drawW, drawH);
            }

            cvs.toBlob(b => {
                if (b) setProjectedSize(b.size);
            }, targetFormat, quality);

        }, 150);
        return ()=>clearTimeout(timer);
    },[width, height, imgObj, resizeMode, lockRatio, quality, outFormat, file]);

    const actualFormat = outFormat === 'original' ? (file ? file.type : '') : outFormat;
    const isPng = actualFormat === 'image/png';

    const handleDownload = () => {
        let ext = '';
        if (actualFormat === 'image/jpeg') ext = '.jpg';
        else if (actualFormat === 'image/webp') ext = '.webp';
        else if (actualFormat === 'image/png') ext = '.png';
        else ext = file.name.substring(file.name.lastIndexOf('.')) || '.png';

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        canvasRef.current.toBlob(b => downloadBlob(b, `${baseName}_resized${ext}`), actualFormat, quality);
    };

    return (
        <div className="flex-1 flex h-full">
            {!imgObj ? <FileUploader onFileSelect={handleFile} icon={Scaling} title="調整圖片大小" desc="無損防變形縮放與壓縮"/> : (
                <div className="flex-1 flex h-full">
                    <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden checkerboard-bg">
                        <canvas ref={canvasRef} className="max-w-full max-h-full shadow-lg" />
                    </div>
                    <div className="w-80 bg-white border-l p-6 shadow-xl flex flex-col z-10 overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">調整設定</h3>
                        
                        <div className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-bold mb-1">原檔大小</span>
                                <span className="text-slate-700">{formatBytes(file.size)}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-slate-500 font-bold mb-1">預估輸出</span>
                                <span className={`${projectedSize >= file.size ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}`}>
                                    {projectedSize ? formatBytes(projectedSize) : '計算中...'}
                                </span>
                            </div>
                        </div>

                        {projectedSize >= file.size && projectedSize > 0 && (
                            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 mb-4 font-medium flex items-start gap-2">
                                <AlertTriangle size={16} className="shrink-0" />
                                <span>此圖片可能已達壓縮極限，或您選擇了無損格式。建議更換為 JPEG/WebP 或縮小尺寸以減少檔案大小。</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button onClick={()=>setLockRatio(!lockRatio)} className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 w-max ${lockRatio?'bg-primary-100 text-primary-700':'bg-slate-100 text-slate-500'}`}>{lockRatio?<LinkIcon size={12}/>:<Unlock size={12}/>} 鎖定比例</button>
                            
                            {!lockRatio && (
                                <div className="space-y-2 pb-2">
                                    <label className="text-xs font-bold text-slate-700">適應模式 (防變形)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={()=>setResizeMode('stretch')} className={`py-1.5 text-xs rounded border ${resizeMode==='stretch'?'bg-primary-50 border-primary-400 text-primary-700':'bg-white text-slate-500 hover:bg-slate-50'}`}>拉伸</button>
                                        <button onClick={()=>setResizeMode('contain')} className={`py-1.5 text-xs rounded border ${resizeMode==='contain'?'bg-primary-50 border-primary-400 text-primary-700':'bg-white text-slate-500 hover:bg-slate-50'}`}>包含 (留白)</button>
                                        <button onClick={()=>setResizeMode('cover')} className={`py-1.5 text-xs rounded border ${resizeMode==='cover'?'bg-primary-50 border-primary-400 text-primary-700':'bg-white text-slate-500 hover:bg-slate-50'}`}>覆蓋 (裁切)</button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">寬度</label><input type="number" value={width} onChange={e=>handleChange(e.target.value,'w')} className="w-full border border-slate-300 rounded px-2 py-1 outline-primary-500"/></div>
                                <div><label className="text-xs font-bold text-slate-500 mb-1 block">高度</label><input type="number" value={height} onChange={e=>handleChange(e.target.value,'h')} className="w-full border border-slate-300 rounded px-2 py-1 outline-primary-500"/></div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">輸出格式</label>
                                <select value={outFormat} onChange={e=>setOutFormat(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white text-slate-700 outline-primary-500">
                                    <option value="original">保持原格式</option>
                                    <option value="image/jpeg">轉為 JPEG (推薦，壓縮率高)</option>
                                    <option value="image/webp">轉為 WebP (體積最小)</option>
                                    <option value="image/png">轉為 PNG (無損，檔案大)</option>
                                </select>
                            </div>

                            {!isPng ? (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">壓縮品質 {Math.round(quality*100)}%</label>
                                    <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-full"/>
                                </div>
                            ) : (
                                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded border border-amber-200 mt-2">
                                    ⚠️ 提示：PNG 為無壓縮無損格式，輸出檔案通常會變大，如需縮小體積請選擇 JPEG。
                                </div>
                            )}
                        </div>
                        <div className="mt-auto pt-6 space-y-2">
                            <button onClick={handleDownload} className="w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-xl font-bold shadow flex items-center justify-center gap-2 transition-transform active:scale-95"><Download size={18}/> 下載圖片</button>
                            <button onClick={()=>{setImgObj(null);setFile(null)}} className="w-full text-slate-400 hover:text-slate-600 py-2 text-sm">取消 / 更換圖片</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasicEditor;
