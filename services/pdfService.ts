// Wait for libraries to load
const waitForLibraries = (): Promise<{ jsPDF: any, html2canvas: any }> => {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50; // 5 seconds max wait
    let attempts = 0;

    const checkLibraries = () => {
      attempts++;
      
      if (typeof (window as any).jspdf !== 'undefined' && typeof (window as any).html2canvas !== 'undefined') {
        resolve({
          jsPDF: (window as any).jspdf.jsPDF,
          html2canvas: (window as any).html2canvas
        });
      } else if (attempts >= maxAttempts) {
        reject(new Error('PDF libraries failed to load within timeout period'));
      } else {
        setTimeout(checkLibraries, 100);
      }
    };

    checkLibraries();
  });
};

export const generatePdf = async (elementId: string, fileName: string): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Wait for libraries to be available
    const { jsPDF, html2canvas } = await waitForLibraries();
    
    const canvas = await html2canvas(input, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Use JPEG with quality compression instead of PNG to reduce file size significantly.
    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    
    // A4 size in points: 595.28 x 841.89
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth;
    let imgHeight = imgWidth / ratio;

    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = imgHeight * ratio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateMultiPagePdf = async (elementId: string, fileName: string): Promise<void> => {
    const input = document.getElementById(elementId);
    if (!input) {
      console.error(`Element with id ${elementId} not found.`);
      return;
    }

    try {
        // Wait for libraries to be available
        const { jsPDF, html2canvas } = await waitForLibraries();
        
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // Use JPEG with quality compression instead of PNG to reduce file size significantly.
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;

        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
        }

        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Error generating multi-page PDF:', error);
        alert(`Failed to generate multi-page PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};