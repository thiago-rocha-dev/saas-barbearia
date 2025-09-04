import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import type { DataTableColumn, DataTableProps } from '../../types/dashboard';

interface SortConfig<T> {
  key: keyof T | null;
  direction: 'asc' | 'desc';
}

type SizeClasses = {
  sm: string;
  md: string;
  lg: string;
};

type VariantClasses = {
  default: string;
  compact: string;
  minimal: string;
};

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  className,
  variant = 'default',
  size = 'md',
  sortable = true,
  searchable = false,
  pagination = false,
  pageSize = 10,
  emptyMessage = 'Nenhum dado encontrado',
  loading = false
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting logic
  const sortedData = useMemo<T[]>(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a: T, b: T): number => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Search logic
  const filteredData = useMemo<T[]>(() => {
    if (!searchable || !searchTerm) return sortedData;

    return sortedData.filter((item: T): boolean =>
      Object.values(item).some((value: any): boolean =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm, searchable]);

  // Pagination logic
  const paginatedData = useMemo<T[]>(() => {
    if (!pagination) return filteredData;

    const startIndex: number = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, pagination]);

  const totalPages: number = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key: keyof T): void => {
    if (!sortable) return;

    setSortConfig((prev: SortConfig<T>): SortConfig<T> => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof T): string => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const sizeClasses: SizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses: VariantClasses = {
    default: 'glass-card backdrop-blur-lg bg-white/5 border border-white/10',
    compact: 'bg-white/5 border border-white/10 rounded-lg',
    minimal: 'bg-transparent'
  };

  if (loading) {
    return (
      <div className={cn(variantClasses[variant], className)}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300/20 rounded w-1/4"></div>
            {[...Array(5)].map((_: undefined, i: number) => (
              <div key={i} className="h-4 bg-gray-300/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {/* Header with search */}
      {searchable && (
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              🔍
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column: DataTableColumn<T>) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-gray-300 uppercase tracking-wide',
                    sizeClasses[size],
                    sortable && column.sortable !== false && 'cursor-pointer hover:text-white transition-colors',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && (
                      <span className="text-xs opacity-50">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item: T, index: number) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {columns.map((column: DataTableColumn<T>) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-4 py-3 text-white',
                        sizeClasses[size],
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render
                        ? column.render(item[column.key], item, index)
                        : String(item[column.key] || '-')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_: undefined, i: number) => {
              const page: number = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-1 rounded text-sm transition-colors',
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  {page}
                </button>
              );
            })}
            
            <span className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;