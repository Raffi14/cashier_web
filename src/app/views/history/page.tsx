"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table-v2";
import { ArrowUpDown, Eye, MoreHorizontal, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

type Transaction = {
  id: number;
  customer_name: string;
  cashier_name: string;
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
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/transaction");
        const data = await res.json();
        setTransactions(data.data);
        setFilteredTransactions(data.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  useEffect(() => {
    let filtered = transactions.filter((trx) =>
      trx.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (startDate && endDate) {
      filtered = filtered.filter((trx) => {
        const trxDate = new Date(trx.sale_date);
        return trxDate >= new Date(startDate) && trxDate <= new Date(endDate);
      });
    }

    if (quickFilter) {
      const today = new Date();
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(today.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      filtered = filtered.filter((trx) => {
        const trxDate = new Date(trx.sale_date);

        if (quickFilter === "today") {
          return trxDate.toDateString() === today.toDateString();
        } else if (quickFilter === "week") {
          return trxDate >= startOfWeek && trxDate <= endOfWeek;
        } else if (quickFilter === "month") {
          return (
            trxDate.getMonth() === today.getMonth() &&
            trxDate.getFullYear() === today.getFullYear()
          );
        } else if (quickFilter === "year") {
          return trxDate.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }

    setFilteredTransactions(filtered);
  }, [startDate, endDate, transactions, searchQuery, quickFilter]);

  const printTransaction = (transaction: Transaction) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(14);
    doc.text(`Detail Transaksi`, 14, 10);
    doc.text(`Pelanggan: ${transaction.customer_name}`, 14, 20);
    doc.text(`Total Harga: Rp ${transaction.total_price.toLocaleString("id-ID")}`, 14, 30);
    const saleDate = new Date(transaction.sale_date);
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(saleDate);
  
    doc.text(`Tanggal: ${formattedDate}`, 14, 40);
  
    doc.autoTable({
      head: [["No", "Produk", "Kuantitas", "Harga Satuan", "Subtotal"]],
      body: transaction.items.map((item, index) => [
        index + 1,
        item.product_name,
        item.quantity,
        `Rp ${Math.round(item.sub_total / item.quantity).toLocaleString("id-ID")}`,
        `Rp ${item.sub_total.toLocaleString("id-ID")}`,
      ]),
      startY: 50,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 112, 192],
        textColor: 255,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      columnStyles: {
        2: { halign: "center" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });
  
    doc.save(`Transaksi_${transaction.id}.pdf`);
  };
  


  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(14);
    doc.text("Laporan Transaksi", 14, 10);

    const head = [
      [
        "ID",
        "Pelanggan",
        "Total Harga",
        "Tanggal",
        "Produk",
        "Qty",
        "Harga Satuan",
        "Subtotal",
      ],
    ];

    const body = filteredTransactions.flatMap((trx) =>
      trx.items.map((item, index) => [
        index === 0 ? trx.id : "",
        index === 0 ? trx.customer_name : "",
        index === 0 ? `Rp ${trx.total_price.toLocaleString("id-ID")}` : "",
        index === 0 ? new Date(trx.sale_date).toLocaleDateString("id-ID") : "",
        item.product_name,
        item.quantity,
        `Rp ${Math.round(item.sub_total / item.quantity).toLocaleString(
          "id-ID"
        )}`,
        `Rp ${item.sub_total.toLocaleString("id-ID")}`,
      ])
    );

    doc.autoTable({
      head,
      body,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 112, 192],
        textColor: 255,
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: { 4: { cellWidth: "auto" } },
      theme: "striped",
    });
    doc.save("Laporan_Transaksi.pdf");
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.index + 1, 
    },
    { accessorKey: "cashier_name", header: "Kasir" },
    { accessorKey: "customer_name", header: "Pelanggan" },
    {
      accessorKey: "total_price",
      header: "Total",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("total_price"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "sale_date",
      header: "Tanggal",
      cell: ({ row }) => new Date(row.original.sale_date).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTransaction(row.original)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Eye className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => printTransaction(row.original)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Printer className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-4 w-full mx-auto h-screen overflow-auto scrollbar-hide">
      <div className="flex gap-6 mb-2">
        <Input
          type="text"
          placeholder="Cari nama pelanggan..."
          className="w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Input
          type="date"
          className="w-36"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <p className="pt-2">s/d</p>
        <Input
          type="date"
          className="w-36"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Select value={quickFilter} onValueChange={setQuickFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="week">Minggu Ini</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
            <SelectItem value="year">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportToPDF}>Export PDF</Button>
      </div>
      <DataTable columns={columns} data={filteredTransactions} />
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent
          aria-describedby="Detail"
          className="max-w-lg bg-white rounded-lg shadow-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <p className="text-gray-700">
                  <strong>ID:</strong> {selectedTransaction.id}
                </p>
                <p className="text-gray-700">
                  <strong>Customer:</strong> {selectedTransaction.customer_name}
                </p>
                <p className="text-gray-700">
                  <strong>Total Harga:</strong>{" "}
                  {formatPrice(selectedTransaction.total_price)}
                </p>
                <p className="text-gray-700">
                  <strong>Tanggal:</strong>{" "}
                  {new Date(selectedTransaction.sale_date).toLocaleDateString()}
                </p>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Produk
              </h3>
              <div className="overflow-x-auto">
                <Table className="w-full border border-gray-200 rounded-lg">
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="px-4 py-2 text-left">
                        Nama Produk
                      </TableHead>
                      <TableHead className="px-4 py-2 text-center">
                        Kuantitas
                      </TableHead>
                      <TableHead className="px-4 py-2 text-right">
                        Subtotal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.items.map((item, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <TableCell className="px-4 py-2">
                          {item.product_name}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right">
                          {formatPrice(item.sub_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
