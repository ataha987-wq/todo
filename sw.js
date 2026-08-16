function generateReport() {
  const from = document.getElementById('exportFrom').value;
  const to = document.getElementById('exportTo').value;
  const filterType = document.getElementById('exportFilterType').value;

  let filtered = [...tasks];

  if (filterType === 'active') filtered = filtered.filter(t => !t.is_completed);
  if (filterType === 'completed') filtered = filtered.filter(t => t.is_completed);

  if (from) filtered = filtered.filter(t => t.created_at.slice(0, 10) >= from);
  if (to) filtered = filtered.filter(t => t.created_at.slice(0, 10) <= to);

  // استخدام الفاصلة المنقوطة (;) ليفهم إكسل تقسيم الأعمدة تلقائياً
  let csv = "\uFEFFالمهمة;تاريخ الإنشاء;حالة المهمة;الخطوة;تاريخ الخطوة\n";

  filtered.forEach(t => {
    const status = t.is_completed ? "منفذة" : "جارية";
    
    if (!t.steps || t.steps.length === 0) {
      csv += `"${t.title}";"${t.created_at}";"${status}";"-";"-"\n`;
    } else {
      t.steps.forEach(s => {
        // تنظيف النص من أي علامات تنصيص قد تسبب مشكلة
        const cleanTitle = t.title.replace(/"/g, '""');
        const cleanStep = s.text.replace(/"/g, '""');
        csv += `"${cleanTitle}";"${t.created_at}";"${status}";"${cleanStep}";"${s.timestamp}"\n`;
      });
    }
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `تقرير_المهام_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  closeExportModal();
}