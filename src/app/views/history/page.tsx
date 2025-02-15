"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table-v2";
import { ArrowUpDown, MoreHorizontal, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Transaction = {
  id: number;
  customer_name: string;
  total_price: number;
  sale_date: string;
  items: {
    product_name: string;
    quantity: number;
    sub_total: number;
  }[];
};

export default function HistoryTransaksi() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/transaction");
        const data = await res.json();
        setTransactions(data.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const handleViewDetails = (trx : Transaction) => {
    setSelectedTransaction(trx);
  };

  const handlePrint = (trx : Transaction) => {
    alert(`Print transaction: ${trx.customer_name}`);
  };

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "id", header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    { accessorKey: "customer_name", header: "Pelanggan" },
    { accessorKey: "total_price", header: "Total", cell: ({ row }) => `Rp ${row.original.total_price.toLocaleString()}` },
    { accessorKey: "sale_date", header: "Tanggal", cell: ({ row }) => new Date(row.original.sale_date).toLocaleDateString() },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2">
              <MoreHorizontal className="w-5 h-5 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>Lihat Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint(row.original)}>Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 border-b-2">Riwayat Transaksi</h1>
      <div className="overflow-x-auto">
      <DataTable columns={columns} data={transactions}/>
      </div>
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div>
              <p><strong>ID:</strong> {selectedTransaction.id}</p>
              <p><strong>Customer:</strong> {selectedTransaction.customer_name}</p>
              <p><strong>Total Harga:</strong> {formatPrice(selectedTransaction.total_price)}</p>
              <p><strong>Tanggal:</strong> {new Date(selectedTransaction.sale_date).toLocaleDateString()}</p>

              <h3 className="mt-4 font-bold">Produk:</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Kuantitas</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTransaction.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatPrice(item.sub_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
