import React, { useState, useEffect, useRef } from 'react';
import { Zap, Loader2, Download } from 'lucide-react';
import FileUploader from './FileUploader';
import { downloadBlob } from '../utils/helpers';

const SharpenTool = () => {
    const [file, setFile] = useState(null);
    const [imgObj, setImgObj] = useState(null);
    const [sharpness, setSharpness] = useState(1); 
    const [processing, setProcessing] = useState(false);
    const canvasRef = useRef(null);

    const handleFile = (f) => {
        if(!f) return;
        setFile(f);
        const img = new Image();
        img.onload = () => { setImgObj(img); };
        img.src = URL.createObjectURL(f);
    };

    const processSharpen = () => {
        if(!imgObj || !canvasRef.current) return;
        setProcessing(true);
        setTimeout(() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            ctx.drawImage(imgObj, 0, 0);
            
            if (sharpness > 0) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const w = imageData.width;
                const h = imageData.height;
                const data = imageData.data;
                const buff = new Uint8ClampedArray(data); 
                
                const mix = sharpness * 0.5; 
                const kernel = [0, -mix, 0, -mix, 1 + 4*mix, -mix, 0, -mix, 0];

                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        for (let c = 0; c < 3; c++) { 
                            let i = (y * w + x) * 4 + c;
                            let sum = 0;
                            sum += buff[((y-1) * w + (x)) * 4 + c] * kernel[1]; 
                            sum += buff[((y) * w + (x-1)) * 4 + c] * kernel[3]; 
                            sum += buff[((y) * w + (x)) * 4 + c]   * kernel[4]; 
                            sum += buff[((y) * w + (x+1)) * 4 + c] * kernel[5]; 
                            sum += buff[((y+1) * w + (x)) * 4 + c] * kernel[7]; 
                            data[i] = sum;
                        }
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }
            setProcessing(false);
        }, 100);
    };

    useEffect(() => { if (imgObj) processSharpen(); }, [sharpness, imgObj]);

    return (
        <div className="flex-1 flex h-full">
            {!imgObj ? (
                <FileUploader onFileSelect={handleFile} icon={Zap} title="圖片變清晰" desc="模糊圖片修復與銳化" />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-50 overflow-hidden">
                    <div className="max-w-6xl w-full h-full flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden shadow-inner relative">
                            {processing && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600"/></div>}
                            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-lg"/>
                        </div>
                        <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg border border-slate-100 p-6 flex flex-col shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Zap className="text-accent-500"/> 智慧銳化</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2"><label className="text-sm font-bold text-slate-700">清晰度 (強度)</label><span className="text-sm font-mono text-primary-600">{sharpness}</span></div>
                                    <input type="range" min="0" max="5" step="0.1" value={sharpness} onChange={e=>setSharpness(Number(e.target.value))} className="w-full"/>
                                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>柔和</span><span>強烈</span></div>
                                </div>
                                <div className="bg-primary-50 p-4 rounded-lg text-sm text-primary-800"><p>💡 提示：適度的銳化可以讓模糊的照片看起來更清晰，但過度銳化可能會產生噪點。</p></div>
                            </div>
                            <div className="mt-auto space-y-3">
                                <button onClick={()=>canvasRef.current.toBlob(b=>downloadBlob(b, `sharpened_${file.name}`))} className="w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"><Download size={20}/> 下載清晰圖片</button>
                                <button onClick={()=>{setImgObj(null);setFile(null)}} className="w-full text-slate-400 hover:text-slate-600 text-sm py-2">更換圖片</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharpenTool;
