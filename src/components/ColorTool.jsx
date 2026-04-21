import React, { useState, useRef } from 'react';
import { Pipette } from 'lucide-react';
import FileUploader from './FileUploader';
import { rgbToHex } from '../utils/helpers';

const ColorTool = () => {
    const [file, setFile] = useState(null);
    const canvasRef = useRef(null);
    const [color, setColor] = useState({r:0,g:0,b:0,hex:'#000000'});
    const [pos, setPos] = useState({x:0, y:0});
    const [showCursor, setShowCursor] = useState(false);

    const handleFile = (f) => {
        if(!f) return;
        setFile(f);
        const img = new Image();
        img.onload = () => {
            const cvs = canvasRef.current;
            const ctx = cvs.getContext('2d');
            const scale = Math.min(800/img.width, 600/img.height);
            cvs.width = img.width * scale; cvs.height = img.height * scale;
            ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        };
        img.src = URL.createObjectURL(f);
    };

    const handleMove = (e) => {
        const cvs = canvasRef.current;
        const rect = cvs.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        if(x<0||x>rect.width||y<0||y>rect.height) {setShowCursor(false); return;}
        
        const ctx = cvs.getContext('2d');
        const p = ctx.getImageData(x, y, 1, 1).data;
        setColor({r:p[0], g:p[1], b:p[2], hex:rgbToHex(p[0],p[1],p[2])});
        setPos({x:e.clientX, y:e.clientY});
        setShowCursor(true);
    };

    return (
        <div className="flex-1 flex h-full">
            {!file ? <FileUploader onFileSelect={handleFile} icon={Pipette} title="色彩工具" desc="點擊圖片獲取色碼"/> : (
                <div className="flex-1 flex flex-col lg:flex-row h-full bg-slate-50 relative overflow-hidden">
                    {showCursor && (
                        <div className="fixed pointer-events-none z-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center"
                             style={{left:pos.x+20, top:pos.y+20, width:60, height:60, background:color.hex}}>
                             <span className="text-[10px] font-bold mix-blend-difference text-white">{color.hex}</span>
                        </div>
                    )}
                    <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden cursor-crosshair checkerboard-bg touch-none" 
                         onMouseMove={handleMove} onMouseLeave={()=>setShowCursor(false)}
                         onTouchMove={(e) => handleMove(e.touches[0])} onTouchEnd={()=>setShowCursor(false)} onTouchCancel={()=>setShowCursor(false)} 
                         onClick={()=>{
                             navigator.clipboard.writeText(color.hex);
                             alert(`已複製色碼 ${color.hex}`);
                         }}>
                        <canvas ref={canvasRef} className="shadow-2xl max-w-full max-h-full"/>
                    </div>
                    <div className="w-full lg:w-64 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex flex-col justify-center space-y-6 shadow-xl z-10 shrink-0">
                        <div className="w-full aspect-video rounded-xl shadow-inner border border-slate-200" style={{background:color.hex}}></div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-slate-400 font-bold">HEX</label><div className="text-xl font-mono font-bold text-primary-600">{color.hex}</div></div>
                            <div><label className="text-xs text-slate-400 font-bold">RGB</label><div className="text-sm font-mono text-slate-700">{color.r}, {color.g}, {color.b}</div></div>
                        </div>
                        <button onClick={()=>{setFile(null)}} className="mt-auto text-slate-400 hover:text-primary-600">更換圖片</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorTool;
