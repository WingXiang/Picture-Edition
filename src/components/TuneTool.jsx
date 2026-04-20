import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, Undo2, Download, RotateCw, FlipHorizontal } from 'lucide-react';
import FileUploader from './FileUploader';
import { downloadBlob } from '../utils/helpers';

const TuneTool = () => {
    const [file, setFile] = useState(null);
    const [imgObj, setImgObj] = useState(null);
    const canvasRef = useRef(null);

    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [rotation, setRotation] = useState(0); 
    const [flipH, setFlipH] = useState(1); 

    const handleFile = (f) => {
        if(!f) return;
        setFile(f);
        const img = new Image();
        img.onload = () => {
            setImgObj(img);
            resetAdjustments();
        };
        img.src = URL.createObjectURL(f);
    };

    const resetAdjustments = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setRotation(0);
        setFlipH(1);
    };

    useEffect(() => {
        if (!imgObj || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const isRotated = rotation % 180 !== 0;
        canvas.width = isRotated ? imgObj.height : imgObj.width;
        canvas.height = isRotated ? imgObj.width : imgObj.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH, 1);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(imgObj, -imgObj.width / 2, -imgObj.height / 2);
        ctx.restore();
    }, [imgObj, brightness, contrast, saturation, rotation, flipH]);

    const handleDownload = () => {
        if (!canvasRef.current || !file) return;
        canvasRef.current.toBlob(blob => downloadBlob(blob, `tuned_${file.name}`), file.type, 0.95);
    };

    return (
        <div className="flex-1 flex h-full">
            {!imgObj ? (
                <FileUploader onFileSelect={handleFile} icon={SlidersHorizontal} title="光影與調整" desc="亮度、色彩與翻轉修正" />
            ) : (
                <div className="flex-1 flex flex-col lg:flex-row h-full">
                    <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden checkerboard-bg">
                        <canvas ref={canvasRef} className="max-w-full max-h-full shadow-lg transition-all duration-200 ease-out" />
                    </div>

                    <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 shadow-xl overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">影像調整</h3>
                            <button onClick={resetAdjustments} className="text-xs text-slate-500 hover:text-primary-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                <Undo2 size={12}/> 重設
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8 flex-1">
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-bold text-slate-700">亮度 (Brightness)</label>
                                        <span className="text-xs font-mono text-slate-500">{brightness}%</span>
                                    </div>
                                    <input type="range" min="0" max="200" value={brightness} onChange={e=>setBrightness(e.target.value)} className="w-full"/>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-bold text-slate-700">對比 (Contrast)</label>
                                        <span className="text-xs font-mono text-slate-500">{contrast}%</span>
                                    </div>
                                    <input type="range" min="0" max="200" value={contrast} onChange={e=>setContrast(e.target.value)} className="w-full"/>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-bold text-slate-700">飽和度 (Saturation)</label>
                                        <span className="text-xs font-mono text-slate-500">{saturation}%</span>
                                    </div>
                                    <input type="range" min="0" max="200" value={saturation} onChange={e=>setSaturation(e.target.value)} className="w-full"/>
                                </div>
                            </div>

                            <hr className="border-slate-100"/>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">方向與變形</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setRotation((r) => (r + 90) % 360)}
                                        className="py-3 bg-slate-50 border border-slate-200 hover:border-primary-400 hover:text-primary-600 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors"
                                    >
                                        <RotateCw size={18}/>
                                        <span className="text-xs font-medium">旋轉 90°</span>
                                    </button>
                                    <button 
                                        onClick={() => setFlipH(f => f * -1)}
                                        className="py-3 bg-slate-50 border border-slate-200 hover:border-primary-400 hover:text-primary-600 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors"
                                    >
                                        <FlipHorizontal size={18}/>
                                        <span className="text-xs font-medium">水平翻轉</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <button onClick={handleDownload} className="w-full bg-accent-500 hover:bg-accent-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-accent-200 flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <Download size={20}/> 下載結果
                            </button>
                            <button onClick={()=>{setImgObj(null);setFile(null)}} className="w-full text-slate-400 hover:text-slate-600 text-sm py-3 font-medium">更換圖片</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TuneTool;
