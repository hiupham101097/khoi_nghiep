// ============================================================================
// CEO EMPIRE: SAVE & LOAD MODAL (Quản Lý 3 Slot Lưu Game & Xuất/Nhập JSON)
// ============================================================================

import React, { useState } from 'react';
import { GameStateManager } from '../engine/core/GameStateManager';
import { SaveLoadManager } from '../engine/save/SaveLoadManager';
import { X, Save, Download, Upload, RotateCcw, Check } from 'lucide-react';
import { soundManager } from '../engine/core/SoundManager';

interface SaveMenuModalProps {
  gsm: GameStateManager;
  onClose: () => void;
}

export const SaveMenuModal: React.FC<SaveMenuModalProps> = ({ gsm, onClose }) => {
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);

  const handleSaveSlot = (slot: number) => {
    const success = SaveLoadManager.saveGame(gsm.exportState(slot), slot);
    if (success) {
      soundManager.playSuccess();
      setSaveStatusMsg(`Đã lưu thành công vào Slot ${slot}!`);
      setTimeout(() => setSaveStatusMsg(null), 3000);
    }
  };

  const handleLoadSlot = (slot: number) => {
    const data = SaveLoadManager.loadGame(slot);
    if (data) {
      gsm.loadState(data);
      soundManager.playSuccess();
      setSaveStatusMsg(`Đã tải dữ liệu Slot ${slot} thành công!`);
      setTimeout(() => {
        setSaveStatusMsg(null);
        onClose();
      }, 1000);
    } else {
      alert(`Slot ${slot} chưa có dữ liệu lưu!`);
    }
  };

  const handleExport = () => {
    SaveLoadManager.exportSaveFile(gsm.exportState(1));
    soundManager.playSuccess();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const loaded = SaveLoadManager.importSaveFile(text);
      if (loaded) {
        gsm.loadState(loaded);
        alert('Nhập file save thành công!');
        onClose();
      } else {
        alert('File save không hợp lệ hoặc bị lỗi định dạng!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Hệ Thống Lưu & Tải Tiến Trình Game</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Slots */}
        <div className="p-6 space-y-5">
          {saveStatusMsg && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveStatusMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Các Vị Trí Lưu Game (Save Slots):
            </span>

            {[1, 2, 3].map((slot) => {
              const saved = SaveLoadManager.loadGame(slot);
              return (
                <div key={slot} className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-100">Slot 0{slot}</h5>
                    {saved ? (
                      <p className="text-[11px] text-slate-400">
                        {saved.companyName} • Ngày {saved.day}/Th.{saved.month} • {saved.playerStats.cash.toLocaleString('vi-VN')} đ
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">Trống (Chưa có dữ liệu)</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveSlot(slot)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Lưu
                    </button>
                    {saved && (
                      <button
                        onClick={() => handleLoadSlot(slot)}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Tải
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Xuất / Nhập JSON file */}
          <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between gap-3">
            <button
              onClick={handleExport}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Xuất File JSON</span>
            </button>

            <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Nhập File JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {/* Nút reset chơi lại từ đầu */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn khởi động lại ván chơi mới từ đầu?')) {
                  window.location.reload();
                }
              }}
              className="w-full bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khởi Động Lại Trò Chơi (Reset)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
