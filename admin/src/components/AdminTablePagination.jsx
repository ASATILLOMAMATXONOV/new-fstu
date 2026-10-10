import TablePagination from '@mui/material/TablePagination';

export default function AdminTablePagination({
  rowsPerPageOptions = [10, 25, 50],
  ...props
}) {
  return (
    <TablePagination
      component="div"
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage="Sahifada:"
      showFirstButton
      showLastButton
      {...props}
    />
  );
}
