import React, { useState, useRef } from 'react';
import { Eraser, Download, Loader2, Sparkles } from 'lucide-react';
import FileUploader from './FileUploader';
import { removeBackground } from '@imgly/background-removal';
import { downloadBlob } from '../utils/helpers';

const BgRemover = () => {
    const [file, setFile] = useState(null);
    const [originalImg, setOriginalImg] = useState(null);
    const [resultBlob, setResultBlob] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, processing, done, error
    const [progress, setProgress] = useState('');

    const handleFile = async (f) => {
        if (!f) return;
        setFile(f);
        setOriginalImg(URL.createObjectURL(f));
        setStatus('processing');
        setProgress('正在載入高階人物偵測 AI 模型... (初次執行需要下載較大模型，請耐心等候)');

        try {
            const config = {
                // 恢復使用預設的高精度 isnet 模型，避免載入失敗
                output: {
                    format: 'image/png', // 確保輸出為具有 Alpha 通道的透明 PNG
                    quality: 1.0 // 最高品質
                },
                progress: (key, current, total) => {
                    if (key.includes('fetch')) {
                        const percent = total ? Math.round((current / total) * 100) : 0;
                        if(percent > 0) setProgress(`下載專屬 AI 模型中... ${percent}%`);
                    } else if (key.includes('compute')) {
                        setProgress('AI 精細運算中，嚴格分離背景與主體...');
                    }
                }
            };
            
            // 執行去背
            const blob = await removeBackground(f, config);
            setResultBlob(blob);
            setStatus('done');
            setProgress('');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setProgress('去背過程中發生錯誤，可能因為您的設備不支援此 AI 模型，請重試。');
        }
    };

    const handleDownload = () => {
        if (!resultBlob || !file) return;
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        // 強制儲存為 PNG，確保在其他軟體(如 PS, PPT)中維持透明背景
        downloadBlob(resultBlob, `${baseName}_nobg_hd.png`);
    };

    const handleReset = () => {
        setFile(null);
        setOriginalImg(null);
        setResultBlob(null);
        setStatus('idle');
        setProgress('');
    };

    return (
        <div className="flex-1 flex h-full">
            {!file ? (
                <FileUploader onFileSelect={handleFile} icon={Eraser} title="人物精準去背" desc="嚴格偵測人物主體，輸出高清透明 PNG" />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
                    <div className="max-w-5xl w-full flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Sparkles className="text-primary-500" size={20} />
                                智慧去背處理 (人物優化模式)
                            </h3>
                            {status === 'done' && (
                                <button onClick={handleReset} className="text-sm text-slate-500 hover:text-primary-600 font-medium px-3 py-1 rounded hover:bg-slate-200 transition-colors">
                                    更換圖片
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 flex items-center justify-center relative checkerboard-bg">
                            {status === 'processing' && (
                                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                        <Eraser className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-600" size={24} />
                                    </div>
                                    <h4 className="mt-6 text-xl font-bold text-slate-800">正在處理圖片...</h4>
                                    <p className="mt-2 text-sm text-slate-500 font-medium text-center px-4 max-w-md">{progress}</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="absolute inset-0 z-10 bg-white/90 flex flex-col items-center justify-center">
                                    <div className="text-red-500 mb-4"><Eraser size={48} /></div>
                                    <h4 className="text-xl font-bold text-slate-800">處理失敗</h4>
                                    <p className="text-slate-500 mt-2">{progress}</p>
                                    <button onClick={handleReset} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">重試</button>
                                </div>
                            )}

                            {/* Images Container */}
                            <div className="flex gap-8 w-full h-full p-4 items-center justify-center">
                                {status === 'done' ? (
                                    <>
                                        <div className="flex-1 flex flex-col h-full max-h-[60vh] max-w-[45%]">
                                            <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-center">原圖</span>
                                            <div className="flex-1 rounded-xl overflow-hidden shadow-inner bg-slate-100 flex items-center justify-center p-2">
                                                <img src={originalImg} className="max-w-full max-h-full object-contain opacity-70 filter blur-[2px] transition-all hover:filter-none hover:opacity-100" alt="Original" />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col h-full max-h-[60vh] max-w-[45%]">
                                            <span className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wider text-center">去背完成 (透明背景)</span>
                                            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl bg-transparent flex items-center justify-center p-2 relative">
                                                <img src={URL.createObjectURL(resultBlob)} className="max-w-full max-h-full object-contain relative z-10" alt="Result" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center max-h-[60vh]">
                                        <img src={originalImg} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" alt="Original" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        {status === 'done' && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                                <button onClick={handleDownload} className="w-80 bg-accent-500 hover:bg-accent-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-accent-200 flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg">
                                    <Download size={24}/> 下載高清透明 PNG
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BgRemover;
