import React from 'react';

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export function useTablePagination(items = [], options = {}) {
  const rowsPerPageOptions = options.rowsPerPageOptions || DEFAULT_ROWS_PER_PAGE_OPTIONS;
  const initialRowsPerPage =
    options.initialRowsPerPage || rowsPerPageOptions[0] || DEFAULT_ROWS_PER_PAGE_OPTIONS[0];
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const totalCount = Array.isArray(items) ? items.length : 0;

  React.useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1);

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, rowsPerPage, totalCount]);

  const paginatedItems = React.useMemo(() => {
    if (!Array.isArray(items)) {
      return [];
    }

    const startIndex = page * rowsPerPage;
    return items.slice(startIndex, startIndex + rowsPerPage);
  }, [items, page, rowsPerPage]);

  const handlePageChange = (_event, nextPage) => {
    setPage(nextPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value) || initialRowsPerPage);
    setPage(0);
  };

  const getRowNumber = (index) => page * rowsPerPage + index + 1;

  return {
    page,
    rowsPerPage,
    totalCount,
    rowsPerPageOptions,
    paginatedItems,
    handlePageChange,
    handleRowsPerPageChange,
    getRowNumber
  };
}
