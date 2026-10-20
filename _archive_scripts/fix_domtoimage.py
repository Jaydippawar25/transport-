import sys
import re

def update_file(filepath, orientation):
    content = open(filepath, encoding='utf-8').read()
    
    content = content.replace("import html2canvas from 'html2canvas';", "import domtoimage from 'dom-to-image-more';")
    
    # regex to replace the try block inner code
    import re
    # We want to replace the try block that does html2canvas
    # It looks like:
    #      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    #      const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    old_canvas_code = """      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);"""
      
    if old_canvas_code not in content:
        # StockOut.jsx has extra indentation
        old_canvas_code = """                const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);"""
                
        new_canvas_code = """                const scale = 2;
                const imgData = await domtoimage.toJpeg(element, {
                  quality: 1.0,
                  bgcolor: '#ffffff',
                  width: element.clientWidth * scale,
                  height: element.clientHeight * scale,
                  style: {
                    transform: 'scale(' + scale + ')',
                    transformOrigin: 'top left'
                  }
                });
                const canvas = { width: element.clientWidth * scale, height: element.clientHeight * scale };"""
    else:
        new_canvas_code = """      const scale = 2;
      const imgData = await domtoimage.toJpeg(element, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: element.clientWidth * scale,
        height: element.clientHeight * scale,
        style: {
          transform: 'scale(' + scale + ')',
          transformOrigin: 'top left'
        }
      });
      const canvas = { width: element.clientWidth * scale, height: element.clientHeight * scale };"""

    content = content.replace(old_canvas_code, new_canvas_code)
    open(filepath, 'w', encoding='utf-8').write(content)

update_file('src/pages/StockOut.jsx', 'landscape')
update_file('src/components/MemoPrintModal.jsx', 'landscape')
update_file('src/components/LRPrintModal.jsx', 'portrait')
