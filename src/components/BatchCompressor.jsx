import React, { useState, useEffect, useRef } from 'react';
import { Images, X, AlertTriangle, Loader2, Archive } from 'lucide-react';
import { downloadBlob, formatBytes } from '../utils/helpers';

const BatchCompressor = () => {
    const [files, setFiles] = useState([]);
    const [quality, setQuality] = useState(0.8);
    const [format, setFormat] = useState('image/jpeg');
    const [maxWidth, setMaxWidth] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [compressedSizes, setCompressedSizes] = useState({});
    const fileInputRef = useRef(null);

    const handleFiles = (newFiles) => {
        const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        const newEntries = validFiles.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            preview: URL.createObjectURL(f),
            originalSize: f.size
        }));
        setFiles(prev => [...prev, ...newEntries]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    useEffect(() => {
        let isCancelled = false;
        const calculateSizes = async () => {
            for (const item of files) {
                if (isCancelled) break;
                
                const img = new Image();
                img.src = item.preview;
                await new Promise(r => { img.onload = r; img.onerror = r; });
                
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                if (maxWidth > 0 && (w > maxWidth || h > maxWidth)) {
                    if (w > h) { h = Math.round(h * (maxWidth / w)); w = maxWidth; } 
                    else { w = Math.round(w * (maxWidth / h)); h = maxWidth; }
                }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                
                if (format === 'image/jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                }
                ctx.drawImage(img, 0, 0, w, h);
                
                await new Promise(r => {
                    canvas.toBlob(b => {
                        if (b && !isCancelled) {
                            setCompressedSizes(prev => ({...prev, [item.id]: b.size}));
                        }
                        r();
                    }, format, quality);
                });
            }
        };

        const timer = setTimeout(() => {
            if (files.length > 0) calculateSizes();
        }, 300);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [files, quality, format, maxWidth]);

    const handleProcessAndDownload = async () => {
        setIsProcessing(true);
        const zip = new window.JSZip();

        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            const img = new Image();
            img.src = item.preview;
            await new Promise(r => img.onload = r);

            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (maxWidth > 0 && (w > maxWidth || h > maxWidth)) {
                if (w > h) { h = Math.round(h * (maxWidth / w)); w = maxWidth; } 
                else { w = Math.round(w * (maxWidth / h)); h = maxWidth; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            
            if (format === 'image/jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0, w, h);

            const ext = format === 'image/jpeg' ? '.jpg' : format === 'image/webp' ? '.webp' : '.png';
            const baseName = item.file.name.replace(/\.[^/.]+$/, "");
            const fileName = `${baseName}_compressed${ext}`;

            const blob = await new Promise(r => canvas.toBlob(r, format, quality));
            zip.file(fileName, blob);
        }

        const content = await zip.generateAsync({ type: "blob" });
        downloadBlob(content, "compressed_images.zip");
        setIsProcessing(false);
    };

    return (
        <div className="flex-1 flex h-full">
            {files.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50">
                    <label className="flex flex-col items-center justify-center w-full max-w-xl h-48 md:h-64 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:bg-white hover:border-primary-400 hover:shadow-lg transition-all bg-slate-50 group mx-4 md:mx-0">
                        <div className="p-6 md:p-4 bg-primary-100 rounded-full mb-0 md:mb-4 text-primary-600 group-hover:scale-110 transition-transform flex items-center justify-center"><Images size={48} className="md:w-8 md:h-8" /></div>
                        <span className="hidden md:block text-xl font-bold text-slate-700">批量壓縮圖片</span>
                        <span className="hidden md:block text-sm text-slate-400 mt-2">支援各種圖片格式，打包下載</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleFiles(e.target.files)} ref={fileInputRef}/>
                    </label>
                </div>
            ) : (
                <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                    <div className="flex-1 p-4 lg:p-8 bg-slate-50 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">已選擇 {files.length} 張圖片</h2>
                            <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm text-slate-700">
                                加入更多圖片
                            </button>
                            <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleFiles(e.target.files)} ref={fileInputRef}/>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {files.map(f => (
                                <div key={f.id} className={`bg-white p-3 rounded-xl border shadow-sm relative group ${compressedSizes[f.id] >= f.originalSize ? 'border-red-300' : 'border-slate-200'}`}>
                                    <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50">
                                        <X size={14}/>
                                    </button>
                                    <div className="aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center checkerboard-bg">
                                        <img src={f.preview} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="text-sm font-medium text-slate-700 truncate" title={f.file.name}>{f.file.name}</div>
                                    <div className="text-xs text-slate-500 mt-1 flex flex-col gap-1">
                                        <div className="text-slate-400 line-through">原: {formatBytes(f.originalSize)}</div>
                                        {compressedSizes[f.id] ? (
                                            <div className={`font-bold ${compressedSizes[f.id] >= f.originalSize ? 'text-red-500' : 'text-green-600'}`}>
                                                → {formatBytes(compressedSizes[f.id])}
                                            </div>
                                        ) : (
                                            <div className="text-slate-400">計算中...</div>
                                        )}
                                    </div>
                                    {compressedSizes[f.id] >= f.originalSize && (
                                        <div className="text-red-500 text-[10px] font-bold mt-2 flex items-start gap-1">
                                            <AlertTriangle size={12} className="shrink-0" />
                                            <span>已達壓縮極限</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex flex-col z-10 shadow-xl overflow-y-auto shrink-0 max-h-[50vh] lg:max-h-full">
                        <h3 className="font-bold text-lg mb-6">批量壓縮設定</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">輸出格式</label>
                                <select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-primary-500">
                                    <option value="image/jpeg">JPEG (推薦，壓縮率高)</option>
                                    <option value="image/webp">WebP (體積最小)</option>
                                    <option value="image/png">PNG (無損，無法壓縮畫質)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">最大邊長 (縮小解析度)</label>
                                <select value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-primary-500">
                                    <option value={0}>保持原解析度</option>
                                    <option value={1920}>1920px (適合螢幕觀看)</option>
                                    <option value={1280}>1280px (適合網頁配圖)</option>
                                    <option value={800}>800px (適合部落格/手機)</option>
                                </select>
                                <p className="text-xs text-slate-400 mt-2">縮小圖片尺寸是減少檔案大小最有效的方法。</p>
                            </div>

                            {format !== 'image/png' ? (
                                <div>
                                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                        <span>壓縮品質</span>
                                        <span className="text-primary-600">{Math.round(quality * 100)}%</span>
                                    </label>
                                    <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full"/>
                                    <p className="text-xs text-slate-400 mt-2">數值越低檔案越小，建議維持在 80% 左右取得畫質與大小的平衡。</p>
                                </div>
                            ) : (
                                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded border border-amber-200 mt-2">
                                    ⚠️ 提示：瀏覽器原生的 PNG 輸出為無壓縮無損格式，檔案通常會比原檔更大。若要縮小體積，請選擇 JPEG 或 WebP。
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 space-y-3">
                            <button 
                                onClick={handleProcessAndDownload} 
                                disabled={isProcessing || files.length === 0}
                                className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-primary-300 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <Archive size={18}/>}
                                {isProcessing ? '正在壓縮與打包...' : '開始壓縮並下載 ZIP'}
                            </button>
                            <button onClick={() => setFiles([])} disabled={isProcessing} className="w-full text-slate-400 hover:text-slate-600 text-sm py-2">
                                清空全部圖片
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchCompressor;
