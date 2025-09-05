const convertToCSV = (data: object[]): string => {
    if (!data || data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let cell = (row as any)[header];
            if (cell === null || cell === undefined) {
                cell = '';
            } else {
                cell = String(cell);
            }
            // Escape quotes by doubling them and wrap in quotes if it contains a comma, quote, or newline
            if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

export const exportToCsv = (filename: string, data: object[]) => {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};