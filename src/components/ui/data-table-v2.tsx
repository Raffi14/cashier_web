"use client";

import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { ColumnDef, flexRender, useReactTable, getCoreRowModel } from "@tanstack/react-table";

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
};

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const firstColumnId = table.getAllColumns()[0]?.id;
  const secondColumnId = table.getAllColumns()[1]?.id;
  return (
    <div className="border rounded-lg shadow">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={
                  header.column.id === firstColumnId ? "w-[80px] text-left pl-4" : 
                  header.column.id === secondColumnId ? "text-left pl-8 w-[200px]" : 
                  "min-w-[150px] text-left"
                }>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id} 
                className="cursor-pointer hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={
                    cell.column.id === firstColumnId ? "w-[80px] text-left pl-9" : 
                    cell.column.id === secondColumnId ? "text-left pl-8 w-[200px]" : 
                    "min-w-[150px] text-left"
                  }>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-4">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
