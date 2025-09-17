import React from 'react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  renderMobileCard?: (item: any, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  renderRow,
  renderMobileCard,
  className = '',
  emptyMessage = 'No data available'
}) => {
  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            {renderMobileCard ? renderMobileCard(item, index) : (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="space-y-2">
                  {columns.filter(col => !col.hideOnMobile).map(column => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        {column.mobileLabel || column.label}:
                      </span>
                      <span className="text-sm text-gray-900">
                        {item[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width ? `w-${column.width}` : ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                {renderRow(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  align = 'left', 
  className = '' 
}) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-${align} ${className}`}>
      {children}
    </td>
  );
};
