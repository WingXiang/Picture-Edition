import React from 'react';

const FileUploader = ({ onFileSelect, icon: Icon, title, desc, accept = "image/*" }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50">
        <label className="flex flex-col items-center justify-center w-full max-w-xl h-64 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:bg-white hover:border-primary-400 hover:shadow-lg transition-all bg-slate-50 group">
            <div className="p-4 bg-primary-100 rounded-full mb-4 text-primary-600 group-hover:scale-110 transition-transform"><Icon size={32}/></div>
            <span className="text-xl font-bold text-slate-700">{title}</span>
            <span className="text-sm text-slate-400 mt-2">{desc || "支援拖曳與貼上 (Ctrl+V)"}</span>
            <input type="file" className="hidden" accept={accept} onChange={e => { onFileSelect(e.target.files[0]); e.target.value = ''; }}/>
        </label>
    </div>
);

export default FileUploader;
