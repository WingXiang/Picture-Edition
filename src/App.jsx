import React, { useState, useEffect } from 'react';
import { useExternalScripts } from './utils/helpers';
import Sidebar from './components/Sidebar';
import TuneTool from './components/TuneTool';
import CropTool from './components/CropTool';
import SharpenTool from './components/SharpenTool';
import BasicEditor from './components/BasicEditor';
import BatchCompressor from './components/BatchCompressor';
import DocExtractor from './components/DocExtractor';
import ColorTool from './components/ColorTool';
import BgRemover from './components/BgRemover';


export default function App() {
    const [activeTab, setActiveTab] = useState('tune');
    const scriptsLoaded = useExternalScripts();

    useEffect(() => {
        const isLine = /Line/i.test(navigator.userAgent);
        if (isLine) {
            alert('您似乎正在使用 LINE 內建瀏覽器，這可能會導致下載功能異常。請點擊右上角選擇「請用預設瀏覽器開啟」以獲得最佳體驗。');
        }
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-slate-50 text-slate-900 overflow-hidden">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative shadow-2xl z-0">
                {activeTab === 'tune' && <TuneTool />}
                {activeTab === 'crop' && <CropTool />}
                {activeTab === 'sharpen' && <SharpenTool />}
                {activeTab === 'bg-remover' && <BgRemover />}
                {activeTab === 'basic' && <BasicEditor />}
                {activeTab === 'batch_compress' && <BatchCompressor />}
                {activeTab === 'extract' && <DocExtractor scriptsLoaded={scriptsLoaded} />}
                {activeTab === 'color' && <ColorTool />}

            </main>
        </div>
    );
}
