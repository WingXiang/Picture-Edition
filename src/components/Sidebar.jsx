import React from 'react';
import { 
    Maximize, Scissors, Scaling, 
    FileArchive, Pipette, Zap, Images, SlidersHorizontal, Eraser, X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
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
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            {/* Sidebar content */}
            <div className={`fixed md:relative top-0 left-0 h-full w-72 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 shrink-0 z-50 shadow-2xl md:shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-2 text-primary-500 font-bold text-xl">
                        <Maximize /> OmniPixel
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex flex-col space-y-2 overflow-y-auto pb-4">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                                activeTab === item.id ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`${activeTab === item.id ? 'text-primary-600' : 'text-slate-500'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{item.name}</div>
                                <div className="text-xs opacity-70 font-normal">{item.desc}</div>
                            </div>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
