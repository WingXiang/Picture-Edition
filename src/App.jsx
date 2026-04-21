import React, { useState, useEffect } from 'react';
import { useExternalScripts } from './utils/helpers';
import { Menu, Maximize, X } from 'lucide-react';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLine, setIsLine] = useState(false);
    const scriptsLoaded = useExternalScripts();

    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        if ((ua.indexOf("Line") > -1) || (ua.indexOf("LINE") > -1)) {
            setIsLine(true);
        }
    }, []);

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-slate-50 text-slate-900 overflow-hidden relative">
            {isLine && (
                <div className="bg-red-500 text-white p-3 md:p-4 text-sm md:text-base text-center z-[100] shadow-lg font-bold">
                    ⚠️ 偵測到您使用 LINE 內建瀏覽器，這會導致無法順利下載圖片。請點選右上角「⋮」，選擇「以預設瀏覽器開啟」以獲得最佳體驗。
                </div>
            )}
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-white p-4 shadow-sm z-30 shrink-0">
                <div className="flex items-center gap-2 text-primary-500 font-bold text-xl">
                    <Maximize /> OmniPixel
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-slate-600 hover:text-primary-600">
                    <Menu size={28} />
                </button>
            </div>

            <div className="flex-1 flex flex-row overflow-hidden relative">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
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
        </div>
    );
}
