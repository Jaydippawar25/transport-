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
 * Robust Excel (.xlsx) file exporter compatible with Mobile WebViews, iOS/Android apps, and Desktop browsers.
 */
export async function exportExcelFile(workbook, fileName) {
  const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  
  try {
    // Generate base64 string from workbook
    const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
    const blob = base64ToBlob(base64, mimeType);
    const file = new File([blob], fileName, { type: mimeType });

    // 1. Try Mobile Web Share API (native share dialog in Android WebView & iOS WKWebView)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: fileName,
          text: `Exported Excel: ${fileName}`
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User cancelled share
        console.warn("Web Share API error, attempting fallbacks:", err);
      }
    }

    // 2. Data URI link fallback for WebViews where blob URLs are restricted
    try {
      const dataUri = `data:${mimeType};base64,${base64}`;
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 200);
      return;
    } catch (dataErr) {
      console.warn("Data URI export failed:", dataErr);
    }
  } catch (err) {
    console.warn("Base64 conversion failed, falling back to XLSX.writeFile:", err);
  }

  // 3. Fallback to default XLSX.writeFile
  XLSX.writeFile(workbook, fileName);
}

/**
 * Robust CSV file exporter compatible with Mobile WebViews and Desktop browsers.
 */
export async function exportCSVFile(content, fileName) {
  const mimeType = 'text/csv;charset=utf-8;';
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });

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
    }, 200);
    return;
  } catch (err) {
    console.warn("CSV Data URI download failed:", err);
  }

  // 3. Blob URL fallback
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
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
      }, 200);
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
