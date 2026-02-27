import React from 'react';

interface Column<T> {
    key: string;
    header: string;
    headerClassName?: string;
    render: (row: T, index: number) => React.ReactNode;
    cellClassName?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[] | null | undefined;
    keyExtractor: (row: T) => string;
    emptyIcon?: string;
    emptyMessage?: string;
    emptySubMessage?: string;
    rowClassName?: string;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    emptyIcon = '📋',
    emptyMessage = 'No hay datos disponibles.',
    emptySubMessage,
    rowClassName = '',
}: DataTableProps<T>) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-primary/10 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.headerClassName || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data && data.length > 0 ? (
                        data.map((row, idx) => (
                            <tr key={keyExtractor(row)} className={`hover:bg-gray-50/50 transition-colors ${rowClassName}`}>
                                {columns.map((col) => (
                                    <td key={col.key} className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ''}`}>
                                        {col.render(row, idx)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                                <div className="text-4xl mb-3">{emptyIcon}</div>
                                <p className="font-medium">{emptyMessage}</p>
                                {emptySubMessage && <p className="text-sm mt-1">{emptySubMessage}</p>}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
