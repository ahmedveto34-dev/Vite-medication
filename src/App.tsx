import { useState, useEffect } from 'react';
import { FileDown, Printer, Search, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { medicines, consumables } from './data';
import { InvoiceItem } from './types';

export default function App() {
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('invoiceItems');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse invoice items from localStorage", e);
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customQuantity, setCustomQuantity] = useState('');

  useEffect(() => {
    localStorage.setItem('invoiceItems', JSON.stringify(items));
  }, [items]);

  const filteredMedicines = medicines.filter(m => m.includes(searchTerm));
  const filteredConsumables = consumables.filter(c => c.includes(searchTerm));

  const handleItemClick = (name: string) => {
    setSelectedItemName(name);
    setQuantity('');
  };

  const handleAddQuantity = () => {
    if (!selectedItemName || !quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) return;
    
    setItems(prev => {
      // Check if item already exists
      const existing = prev.find(i => i.name === selectedItemName);
      if (existing) {
        return prev.map(i => i.name === selectedItemName ? { ...i, quantity: i.quantity + Number(quantity) } : i);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), name: selectedItemName, quantity: Number(quantity) }];
    });
    
    setSelectedItemName(null);
  };

  const handleAddCustom = () => {
    if (!customName.trim() || !customQuantity || isNaN(Number(customQuantity)) || Number(customQuantity) <= 0) return;
    
    const name = customName.trim();
    setItems(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing) {
        return prev.map(i => i.name === name ? { ...i, quantity: i.quantity + Number(customQuantity) } : i);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), name, quantity: Number(customQuantity) }];
    });
    
    setIsCustomModalOpen(false);
    setCustomName('');
    setCustomQuantity('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  // Render the grid of items
  const renderItemGrid = (itemsList: string[], title: string, colorClass: string) => {
    if (itemsList.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-slate-900 border-b border-slate-300/50 pb-2">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {itemsList.map(item => (
            <button
              key={item}
              onClick={() => handleItemClick(item)}
              className={`p-3 border rounded-xl text-sm md:text-base font-bold transition flex flex-col items-center justify-center text-center h-auto min-h-[4rem] active:scale-95 shadow-sm hover:shadow-md ${colorClass}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#eef2f3] bg-gradient-to-br from-[#eef2f3] via-[#8e9eab] to-[#eef2f3] text-slate-800 font-sans print:bg-none p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* Header - Hidden in Print */}
      <header className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-4 mb-6 shadow-xl sticky top-4 z-10 no-print max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">M</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">د. محمد زغلول سعد</h1>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest">عيادة الطب البيطري المتكاملة</p>
            </div>
          </div>
          
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن دواء أو مستهلك..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-3 pr-10 py-3 border border-white/40 rounded-xl leading-5 bg-white/50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-inner backdrop-blur-md transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Items List (Hidden in print) */}
        <div className="lg:w-2/3 no-print">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl border border-white/40 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center bg-white/40 border border-white/50 rounded-2xl p-4 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">الأصناف المتوفرة</h2>
              <button 
                onClick={() => setIsCustomModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة صنف آخر
              </button>
            </div>
            
            <div>
              {renderItemGrid(filteredMedicines, "الأدوية", "bg-white/40 hover:bg-white/60 border-white/40 text-slate-700")}
              {renderItemGrid(filteredConsumables, "المستهلكات", "bg-emerald-50/40 hover:bg-emerald-100/60 border-emerald-200/40 text-emerald-800")}
              
              {filteredMedicines.length === 0 && filteredConsumables.length === 0 && (
                <div className="text-center py-12 text-slate-500 font-medium">
                  لا توجد نتائج مطابقة لبحثك
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Invoice */}
        <div className="lg:w-1/3 print-w-full">
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white p-6 sticky top-32 print-shadow-none print-border-none print-bg-transparent print-p-0 print-backdrop-blur-none">
            
            {/* Invoice Print Header */}
            <div className="text-center mb-6 pb-6 border-b border-slate-200 print-mb-4 print-pb-4">
              <h2 className="text-2xl font-bold text-slate-900">الدكتور البيطري</h2>
              <h3 className="text-3xl font-extrabold text-blue-900 mt-2">محمد زغلول سعد</h3>
              <p className="text-slate-600 mt-1 font-medium">فاتورة طلب أدوية ومستهلكات</p>
              <div className="text-sm text-slate-500 mt-2 font-medium print-text-slate-600">
                التاريخ: {new Date().toLocaleDateString('ar-EG')}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="min-h-[200px]">
              {items.length === 0 ? (
                <div className="text-center text-slate-400 py-12 no-print flex flex-col items-center">
                  <FileDown className="h-12 w-12 mb-3 opacity-20" />
                  <p>الفاتورة فارغة</p>
                  <p className="text-sm mt-1">قم باختيار الأصناف لإضافتها</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-700">
                      <th className="py-2 px-2 w-16 text-center">العدد</th>
                      <th className="py-2 px-2">الصنف</th>
                      <th className="py-2 px-2 w-10 no-print"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {items.map(item => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="border-b border-white/50 hover:bg-white/40 transition-colors"
                        >
                          <td className="py-3 px-2 text-center font-bold text-lg text-blue-700 w-16 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-2 text-slate-800 font-bold">
                            {item.name}
                          </td>
                          <td className="py-3 px-2 text-left no-print w-10">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-white p-1 rounded-md hover:bg-red-500 transition-colors bg-white/40 border border-white/50"
                              title="حذف"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            {/* Print Buttons (Hidden in print) */}
            {items.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-300/50 flex flex-col gap-3 no-print">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition active:scale-95"
                >
                  <Printer className="h-5 w-5" />
                  طباعة / تحميل PDF
                </button>
                <button
                  onClick={() => setItems([])}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-95"
                >
                  <X className="h-5 w-5" />
                  تفريغ الفاتورة
                </button>
              </div>
            )}
            
            <div className="hidden print:block text-center mt-12 pt-4 border-t border-dashed border-slate-300 text-sm text-slate-500">
              شكراً لتعاملكم معنا - مع تحيات الدكتور محمد زغلول سعد
            </div>
          </div>
        </div>
      </main>

      {/* Quantity Modal */}
      <AnimatePresence>
        {selectedItemName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedItemName(null)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white w-full max-w-sm overflow-hidden z-10"
            >
              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-1">إضافة للصنف</h3>
                <p className="text-blue-700 font-bold mb-5">{selectedItemName}</p>
                
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 mb-2">
                    العدد المطلوب
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    autoFocus
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddQuantity();
                    }}
                    className="block w-full px-4 py-3 text-lg border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center shadow-inner font-bold"
                    placeholder="1"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAddQuantity}
                    disabled={!quantity || Number(quantity) <= 0}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="h-5 w-5" />
                    إضافة
                  </button>
                  <button
                    onClick={() => setSelectedItemName(null)}
                    className="flex-1 bg-white/60 border border-white text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-white/80 active:scale-95 transition-all shadow-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Item Modal */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsCustomModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white w-full max-w-sm overflow-hidden z-10"
            >
              <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-5">إضافة صنف غير موجود</h3>
                
                <div className="mb-4">
                  <label htmlFor="customName" className="block text-sm font-bold text-slate-700 mb-2">
                    اسم الصنف
                  </label>
                  <input
                    type="text"
                    id="customName"
                    autoFocus
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="block w-full px-4 py-3 text-lg border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-bold"
                    placeholder="مثال: دواء جديد"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="customQuantity" className="block text-sm font-bold text-slate-700 mb-2">
                    العدد المطلوب
                  </label>
                  <input
                    type="number"
                    id="customQuantity"
                    min="1"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustom();
                    }}
                    className="block w-full px-4 py-3 text-lg border border-white/60 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-bold text-center"
                    placeholder="1"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAddCustom}
                    disabled={!customName.trim() || !customQuantity || Number(customQuantity) <= 0}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="h-5 w-5" />
                    إضافة
                  </button>
                  <button
                    onClick={() => setIsCustomModalOpen(false)}
                    className="flex-1 bg-white/60 border border-white text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-white/80 active:scale-95 transition-all shadow-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
