import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Trash2, Image as ImageIcon, Copy, Database, Loader2, HardDriveUpload, CheckCircle2, Link as LinkIcon, Settings } from 'lucide-react';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Configs
    const [gasUrl, setGasUrl] = useState(localStorage.getItem('omnipixel_gas_url_v3') || '');
    const [imgbbKey, setImgbbKey] = useState(localStorage.getItem('omnipixel_imgbb_key') || '');
    const [showConfig, setShowConfig] = useState(!localStorage.getItem('omnipixel_gas_url_v3') || !localStorage.getItem('omnipixel_imgbb_key'));
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (gasUrl && imgbbKey && !showConfig) {
            fetchGallery();
        }
    }, [gasUrl, imgbbKey, showConfig]);

    const fetchGallery = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(gasUrl);
            const data = await res.json();
            if (Array.isArray(data)) {
                setImages(data.reverse()); // Show newest first
            } else {
                console.error("Invalid response format:", data);
            }
        } catch (err) {
            console.error("Failed to load gallery from Google Sheets:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = () => {
        if (!gasUrl.startsWith('https://script.google.com/')) {
            return alert('請輸入有效的 Google Apps Script 網址');
        }
        if (!imgbbKey) {
            return alert('請輸入 ImgBB API Key');
        }
        localStorage.setItem('omnipixel_gas_url_v3', gasUrl);
        localStorage.setItem('omnipixel_imgbb_key', imgbbKey);
        setShowConfig(false);
        fetchGallery(); // 重新讀取
    };

    const handleUpload = async (e) => {
        if (!gasUrl || !imgbbKey) {
            alert("請先完成圖床與資料庫設定！");
            return;
        }
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            for (const file of files) {
                // 1. 上傳到 ImgBB 獲取真實的 .jpg 網址
                const formData = new FormData();
                formData.append('image', file);
                
                const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
                    method: 'POST',
                    body: formData
                });
                const imgbbData = await imgbbRes.json();
                
                if (!imgbbData.success) {
                    throw new Error(imgbbData.error?.message || "ImgBB 上傳失敗，請檢查 API Key");
                }

                const directUrl = imgbbData.data.url;

                // 2. 將網址與資訊寫入 Google 試算表
                const payload = {
                    action: "upload",
                    name: file.name,
                    url: directUrl
                };

                const gasRes = await fetch(gasUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                
                let result;
                try {
                    result = await gasRes.json();
                } catch(err) {
                    throw new Error("試算表連線失敗！這表示你目前的 Apps Script 版本太舊了，請務必按照畫面中的『第二步』重新覆蓋程式碼並部署。");
                }

                if (result && result.success) {
                    setImages(prev => [{
                        id: result.id,
                        name: result.name,
                        url: result.url,
                        date: result.date
                    }, ...prev]);
                } else {
                    throw new Error(result?.error || "寫入試算表失敗");
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert(`上傳失敗：${err.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("確定要刪除這張圖片嗎？")) return;
        
        const previousImages = [...images];
        setImages(images.filter(img => img.id !== id));

        try {
            const res = await fetch(gasUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "delete", id: id })
            });
            const result = await res.json();
            if(!result.success) throw new Error("API 拒絕刪除");
        } catch (err) {
            console.error(err);
            alert("刪除失敗");
            setImages(previousImages);
        }
    };

    const copyImage = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            alert("已複製圖片網址！可以直接嵌入到 WordPress 中。");
        } catch (err) {
            console.error(err);
            alert("複製失敗。");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
            <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
                        <Cloud size={28} /> 專業外連圖床管理
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">透過 ImgBB 產生真實 .jpg 網址，並以 Google 試算表作為資料庫管理。</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowConfig(!showConfig)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Settings size={18} /> 設定圖床與資料庫
                    </button>
                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                    <button 
                        onClick={() => fileInputRef.current.click()} 
                        disabled={isUploading || !gasUrl || !imgbbKey || showConfig}
                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition-transform active:scale-95"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin"/> : <HardDriveUpload size={18} />}
                        {isUploading ? '正在處理...' : '上傳新圖片'}
                    </button>
                </div>
            </div>

            {showConfig && (
                <div className="absolute inset-x-0 top-24 mx-auto w-full max-w-4xl z-20 bg-white border border-primary-200 shadow-2xl rounded-2xl p-8 overflow-y-auto max-h-[80vh]">
                    <h3 className="text-xl font-bold text-primary-600 mb-6 flex items-center gap-2">
                        <Settings size={24} /> 圖床與資料庫重新串接教學
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        {/* ImgBB Setup */}
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2 border-b pb-2">第一步：ImgBB 圖床設定</h4>
                            <ol className="text-sm text-slate-700 space-y-2 mb-4 list-decimal pl-5">
                                <li>前往 <a href="https://api.imgbb.com/" target="_blank" className="text-primary-600 underline font-bold">ImgBB API</a>。</li>
                                <li>註冊/登入後，點擊 "Add API key" 建立鑰匙。</li>
                                <li>複製那串 API Key 並貼在下方。</li>
                            </ol>
                            <input 
                                type="text" 
                                value={imgbbKey} 
                                onChange={(e) => setImgbbKey(e.target.value)}
                                placeholder="貼上你的 ImgBB API Key"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-primary-500 font-mono text-sm"
                            />
                        </div>

                        {/* Google Sheets Setup */}
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2 border-b pb-2 text-red-600">第二步：更新試算表程式碼 (非常重要)</h4>
                            <p className="text-sm text-red-600 mb-4 font-bold">
                                上傳失敗就是因為沒有更新這段程式碼！因為我們不再上傳到 Google Drive 了，你必須把試算表的程式碼換成以下這段最新版：
                            </p>
                            <pre className="bg-slate-800 text-green-400 p-3 rounded text-[10px] overflow-y-auto max-h-48 mb-4">
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  if (data.action === "upload") {
    var id = new Date().getTime().toString();
    var date = new Date().toLocaleString("zh-TW");
    if(sheet.getLastRow() === 0) sheet.appendRow(["ID", "Name", "URL", "Date"]);
    sheet.appendRow([id, data.name, data.url, date]);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: id, name: data.name, url: data.url, date: date})).setMimeType(ContentService.MimeType.JSON);
  } else if (data.action === "delete") {
    var rows = sheet.getDataRange().getValues();
    for(var i=0; i<rows.length; i++){
      if(rows[i][0] == data.id){ sheet.deleteRow(i+1); break; }
    }
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var result = [];
  for(var i=1; i<rows.length; i++){
    if(rows[i][0]) result.push({ id: rows[i][0], name: rows[i][1], url: rows[i][2], date: rows[i][3] });
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}`}
                            </pre>
                            <ol className="text-sm text-slate-700 space-y-2 mb-4 list-decimal pl-5">
                                <li>在試算表點「擴充功能」&gt;「Apps Script」。</li>
                                <li>刪除舊代碼，貼上上方綠色區塊的新代碼。</li>
                                <li>點右上角「部署」&gt;「新增部署作業」。</li>
                                <li>權限選「所有人」，點擊部署並複製新網址。</li>
                            </ol>
                            <input 
                                type="text" 
                                value={gasUrl} 
                                onChange={(e) => setGasUrl(e.target.value)}
                                placeholder="貼上新的 Apps Script 網址"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-primary-500 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center border-t border-slate-200 pt-6">
                        <button onClick={handleSaveConfig} className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2">
                            <CheckCircle2 size={20} /> 儲存設定並開始使用
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 p-8 overflow-y-auto relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">正在讀取資料庫...</h3>
                    </div>
                ) : (!gasUrl || !imgbbKey) ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Database size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">尚未完成設定</h3>
                        <p className="text-sm">請完成上方設定以啟用圖床功能</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ImageIcon size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">資料庫目前是空的</h3>
                        <p className="text-sm">點擊右上角「上傳新圖片」</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {images.map(img => (
                            <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="aspect-[4/3] bg-slate-100 relative checkerboard-bg flex items-center justify-center p-2">
                                    <img src={img.url} className="max-w-full max-h-full object-contain" alt={img.name} loading="lazy" />
                                    
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <a 
                                            href={img.url} target="_blank" rel="noreferrer"
                                            className="p-2 bg-white text-slate-800 rounded-full hover:bg-primary-50 hover:text-primary-600 shadow flex items-center justify-center" title="在新分頁開啟"
                                        >
                                            <LinkIcon size={18} />
                                        </a>
                                        <button 
                                            onClick={() => copyImage(img.url)} 
                                            className="p-2 bg-white text-slate-800 rounded-full hover:bg-primary-50 hover:text-primary-600 shadow" title="複製 .jpg 網址"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(img.id)} 
                                            className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 shadow" title="刪除圖片"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <div className="text-sm font-bold text-slate-700 truncate" title={img.name}>{img.name}</div>
                                    <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                                        <span className="truncate pr-2">🔗 可直接嵌入</span>
                                        <span>{img.date ? img.date.split(' ')[0] : ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;
