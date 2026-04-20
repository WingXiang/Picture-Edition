import React, { useState } from 'react';
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

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
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
