import React, { useState } from 'react';
import { FileArchive } from 'lucide-react';
import FileUploader from './FileUploader';
import { downloadBlob } from '../utils/helpers';

const DocExtractor = ({ scriptsLoaded }) => {
    const [images, setImages] = useState([]);
    const [status, setStatus] = useState("");

    const handleFile = async (file) => {
        if(!scriptsLoaded || !file) return;
        setImages([]); setStatus("解析中...");
        try {
            let imgs = [];
            if(file.name.endsWith(".docx")) {
                const zip = new window.JSZip();
                const content = await zip.loadAsync(file);
                content.folder("word/media").forEach((path, f) => imgs.push({name:f.name, data:f}));
                imgs = await Promise.all(imgs.map(async f => ({name:f.name, url:URL.createObjectURL(await f.data.async("blob")), blob:await f.data.async("blob")})));
            } else if(file.type==="application/pdf") {
                const pdf = await window.pdfjsLib.getDocument(await file.arrayBuffer()).promise;
                for(let i=1; i<=pdf.numPages; i++){
                    const page = await pdf.getPage(i);
                    const ops = await page.getOperatorList();
                    for(let j=0; j<ops.fnArray.length; j++){
                        if(ops.fnArray[j] === window.pdfjsLib.OPS.paintImageXObject){
                            const name = ops.argsArray[j][0];
                            try{
                                const img = await page.objs.get(name);
                                if(img && (img.width || img.bitmap)){
                                    const cvs = document.createElement('canvas');
                                    cvs.width = img.width||img.bitmap.width; cvs.height = img.height||img.bitmap.height;
                                    const ctx = cvs.getContext('2d');
                                    if(img.bitmap) ctx.drawImage(img.bitmap,0,0);
                                    else ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data),cvs.width,cvs.height),0,0);
                                    const blob = await new Promise(r=>cvs.toBlob(r));
                                    imgs.push({name:`p${i}_img${j}.png`, url:URL.createObjectURL(blob), blob});
                                }
                            }catch(e){}
                        }
                    }
                }
            }
            setImages(imgs); setStatus(`提取了 ${imgs.length} 張圖片`);
        } catch(e) { setStatus("格式錯誤或處理失敗"); console.error(e); }
    };

    const downloadAll = async () => {
        const zip = new window.JSZip();
        images.forEach(i=>zip.file(i.name, i.blob));
        downloadBlob(await zip.generateAsync({type:"blob"}), "extracted.zip");
    };

    return (
        <div className="flex-1 flex h-full">
            {images.length === 0 ? (
                <FileUploader onFileSelect={handleFile} icon={FileArchive} title="文件圖片提取" desc="支援 PDF / DOCX" accept=".docx,.pdf"/>
            ) : (
                <div className="flex-1 p-8 bg-slate-50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">{status}</h2>
                        <div className="flex gap-2">
                            <button onClick={()=>setImages([])} className="px-4 py-2 border rounded hover:bg-white text-slate-700">重來</button>
                            <button onClick={downloadAll} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded shadow font-bold transition-colors">下載全部 ZIP</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start">
                        {images.map((img,i)=>(
                            <div key={i} className="bg-white p-2 rounded shadow hover:scale-105 transition-transform">
                                <div className="aspect-square bg-slate-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                                    <img src={img.url} className="max-w-full max-h-full"/>
                                </div>
                                <div className="text-xs truncate text-slate-500">{img.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocExtractor;
