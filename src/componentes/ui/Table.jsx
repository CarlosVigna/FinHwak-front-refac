export default function Table({ columns = [], data = [], emptyMessage = 'Nenhum registro encontrado.', rowKey, className = '' }) {
    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={['overflow-x-auto rounded-lg border border-border', className].join(' ')}>
            <table className="w-full text-left text-sm text-text">
                <thead className="bg-surface2">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-3 font-medium text-muted2">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr
                            key={rowKey ? rowKey(row, rowIdx) : (row.id ?? rowIdx)}
                            className={rowIdx % 2 === 0 ? 'bg-surface' : 'bg-surface2'}
                        >
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className="px-4 py-3">
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
