import * as XLSX from 'xlsx';

/**
 * Converts a Base64 string to a Blob object.
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Converts an array of objects into Tab-Separated Values (TSV) for easy clipboard copy to Excel / Google Sheets.
 */
function convertToTSV(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return '';
  const headers = Object.keys(dataArray[0]).join('\t');
  const rows = dataArray.map(row => 
    Object.values(row).map(val => {
      if (val === null || val === undefined) return '';
      return String(val).replace(/[\t\n\r]/g, ' ');
    }).join('\t')
  ).join('\n');
  return headers + '\n' + rows;
}

/**
 * Robust Excel (.xlsx) file exporter compatible with Mobile WebViews, Android APK wrappers, iOS/Android apps, and Desktop browsers.
 */
export async function exportExcelFile(workbook, fileName, rawExportData = null) {
  const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  let downloadedViaShare = false;

  try {
    const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
    const blob = base64ToBlob(base64, mimeType);
    const file = new File([blob], fileName, { type: mimeType });

    // 1. Try Mobile Web Share API (Native Android / iOS Share sheet)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: fileName,
          text: `Exported Excel Report: ${fileName}`
        });
        downloadedViaShare = true;
        return;
      } catch (shareErr) {
        if (shareErr.name === 'AbortError') return; // User cancelled share dialog
        console.warn("Web Share API error, using fallbacks:", shareErr);
      }
    }

    // 2. Data URI link fallback
    const octetDataUri = `data:application/octet-stream;base64,${base64}`;
    const link = document.createElement('a');
    link.href = octetDataUri;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 300);

    // 3. For Android WebView wrappers that don't trigger downloads on anchor click
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => {
        try {
          window.location.href = octetDataUri;
        } catch (e) {}
      }, 400);
    }

  } catch (err) {
    console.error("Export Excel conversion error:", err);
    try {
      XLSX.writeFile(workbook, fileName);
    } catch(e) {}
  }

  // 4. Ultimate Fallback for Mobile WebView Apps that block file saving: Copy TSV to Clipboard
  if (!downloadedViaShare && rawExportData && Array.isArray(rawExportData) && rawExportData.length > 0) {
    try {
      const tsvContent = convertToTSV(rawExportData);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tsvContent);
        alert(`📥 Excel Data Copied to Clipboard!\n\nIf your mobile app blocks direct file downloads, open Excel or Google Sheets and tap PASTE.`);
      }
    } catch(clipErr) {
      console.warn("Clipboard copy fallback error:", clipErr);
    }
  }
}

/**
 * Robust CSV file exporter compatible with Mobile WebViews and Desktop browsers.
 */
export async function exportCSVFile(content, fileName, rawExportData = null) {
  const mimeType = 'text/csv;charset=utf-8;';
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });
  let downloadedViaShare = false;

  // 1. Mobile Web Share API
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: fileName
      });
      downloadedViaShare = true;
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn("Web Share API for CSV failed:", err);
    }
  }

  // 2. Data URI fallback
  try {
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 300);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => {
        try {
          window.location.href = encodedUri;
        } catch(e) {}
      }, 400);
    }
  } catch (err) {
    console.warn("CSV Data URI download failed:", err);
  }

  // 3. Clipboard fallback for WebViews
  if (!downloadedViaShare && rawExportData && Array.isArray(rawExportData) && rawExportData.length > 0) {
    try {
      const tsvContent = convertToTSV(rawExportData);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tsvContent);
        alert(`📋 Report Data Copied to Clipboard!\n\nIf your mobile app blocks file downloads, open Excel or Google Sheets and tap PASTE.`);
      }
    } catch(clipErr) {}
  }
}

/**
 * Robust PDF file exporter compatible with Mobile WebViews and Desktop browsers.
 */
export async function exportPdfFile(pdfDoc, fileName) {
  try {
    const blob = pdfDoc.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    // 1. Mobile Web Share API
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: fileName
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn("Web Share API for PDF failed:", err);
      }
    }

    // 2. Data URI fallback
    try {
      const dataUri = pdfDoc.output('datauristring');
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 300);

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        setTimeout(() => {
          try {
            window.location.href = dataUri;
          } catch(e) {}
        }, 400);
      }
      return;
    } catch (err) {
      console.warn("PDF Data URI failed:", err);
    }
  } catch (err) {
    console.warn("PDF export conversion error:", err);
  }

  // 3. Fallback to default jsPDF save
  pdfDoc.save(fileName);
}
