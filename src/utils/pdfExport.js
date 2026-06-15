import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF report from a data table.
 * Builds an off-screen DOM element with forced white/black colors
 * (bypasses CSS variables — safe regardless of active theme).
 *
 * @param {Object} opts
 * @param {string}   opts.title        - Report title (e.g., "Contas a Receber")
 * @param {string}   opts.accountName  - Current account name
 * @param {string}   opts.fileName     - Output .pdf file name
 * @param {string[]} opts.headers      - Table column headers
 * @param {Array[]}  opts.rows         - Table rows (arrays of cell values)
 * @param {string}   [opts.totalLabel] - Optional footer label
 * @param {string}   [opts.totalValue] - Optional footer value
 */
export async function generateReportPDF({
    title,
    accountName,
    fileName,
    headers,
    rows,
    totalLabel,
    totalValue,
}) {
    const now = new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const headerCells = headers
        .map(h => `<th style="background:#f0f0f0;border:1px solid #ccc;padding:7px 8px;font-size:10px;font-weight:700;text-transform:uppercase;color:#000;text-align:left;">${h}</th>`)
        .join('');

    const bodyRows = rows
        .map((row, i) => {
            const bg = i % 2 === 0 ? '#ffffff' : '#f7f7f7';
            const cells = row
                .map(cell => `<td style="border:1px solid #ddd;padding:6px 8px;font-size:11px;color:#000;background:${bg};">${cell ?? '-'}</td>`)
                .join('');
            return `<tr>${cells}</tr>`;
        })
        .join('');

    const footerHtml = totalLabel && totalValue
        ? `<div style="margin-top:16px;padding-top:10px;border-top:1px solid #ccc;display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#000;">
             <span>${totalLabel}</span><span>${totalValue}</span>
           </div>`
        : '';

    const container = document.createElement('div');
    container.style.cssText = [
        'position:absolute',
        'top:-9999px',
        'left:-9999px',
        'width:800px',
        'background:#ffffff',
        'color:#000000',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'font-size:12px',
        'padding:32px',
    ].join(';');

    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;padding-bottom:16px;margin-bottom:20px;border-bottom:2px solid #000;">
            <div style="width:42px;height:42px;background:#e0353c;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px;flex-shrink:0;">FH</div>
            <div>
                <div style="font-size:17px;font-weight:800;color:#000;margin:0 0 2px;">FinHawk</div>
                <div style="font-size:12px;color:#222;margin:0 0 1px;">Relatório: ${title}</div>
                ${accountName ? `<div style="font-size:11px;color:#555;">Conta: ${accountName}</div>` : ''}
                <div style="font-size:11px;color:#777;">Gerado em: ${now}</div>
            </div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
        </table>

        ${footerHtml}

        <div style="margin-top:16px;font-size:10px;color:#aaa;text-align:right;">
            FinHawk — finhawk.com.br &nbsp;·&nbsp; ${now}
        </div>
    `;

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(fileName);
    } finally {
        document.body.removeChild(container);
    }
}
