import React from 'react';
import { 
    Maximize, Scissors, Scaling, 
    FileArchive, Pipette, Zap, Images, SlidersHorizontal, Eraser, Cloud
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'tune', name: '光影與調整', icon: <SlidersHorizontal size={20}/>, desc: '亮度、對比與翻轉' },
        { id: 'crop', name: '裁減圖片', icon: <Scissors size={20}/>, desc: '自由拖曳與比例裁切' },
        { id: 'sharpen', name: '圖片變清晰', icon: <Zap size={20}/>, desc: '模糊修復與銳化' },
        { id: 'bg-remover', name: '智慧去背', icon: <Eraser size={20}/>, desc: 'AI 引擎全自動去背' },
        { id: 'basic', name: '調整圖片大小', icon: <Scaling size={20}/>, desc: '縮放與壓縮 (防變形)' },
        { id: 'batch_compress', name: '批量壓縮', icon: <Images size={20}/>, desc: '多圖高清壓縮打包' },
        { id: 'extract', name: '文件提取', icon: <FileArchive size={20}/>, desc: 'PDF/DOCX 抓圖' },
        { id: 'color', name: '色彩工具', icon: <Pipette size={20}/>, desc: '取色與色票' },

    ];
    return (
        <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col h-auto md:h-full p-2 md:p-4 shrink-0 z-20 shadow-sm overflow-x-auto md:overflow-y-auto" style={{WebkitOverflowScrolling: 'touch'}}>
            <div className="hidden md:flex items-center gap-2 mb-8 text-primary-500 font-bold text-xl px-2">
                <Maximize /> OmniPixel
            </div>
            <nav className="flex flex-row md:flex-col gap-2 md:space-y-2 pb-1 md:pb-4 min-w-max md:min-w-0">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl transition-all text-left ${
                            activeTab === item.id ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {item.icon}
                        <div className="hidden md:block">
                            <div className="text-sm font-semibold">{item.name}</div>
                            <div className="text-xs opacity-70 font-normal">{item.desc}</div>
                        </div>
                        <div className="block md:hidden text-sm font-semibold whitespace-nowrap">
                            {item.name}
                        </div>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
