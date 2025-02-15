"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/http";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

type customers = {
  id: number;
  name: string;
  address: string;
  phone_number: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<customers[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editcustomers, setEditcustomers] = useState<customers | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchcustomers = async () => {
    const response = await httpGet("/api/customer");
    const data = await response.json();
    setCustomers(data.data || []);
  };

  useEffect(() => {
    fetchcustomers();
  }, []);

  const openModal = (customers?: customers, isOpen?: boolean) => {
      setEditcustomers(customers || null);
      setName(customers?.name || "");
      setAddress(customers?.address || "");
      setPhone_number(customers?.phone_number || "");
      setModalOpen(true);
      setIsEditing(isOpen || false);
  };

  const handleSubmit = async () => {
    if (!name || !address || !phone_number) return;
    setLoading(true);
    try {
      const endpoint = isEditing ? `/api/customer/${editcustomers?.id}` : "/api/customer";
      const method = isEditing ? httpPut : httpPost;
      const response = await method(endpoint, { name, address, phone_number });
      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(responseData.error);
        setErrorDialogOpen(true);
        return;
      }

      fetchcustomers();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await httpDelete(`/api/customer/${id}`);
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Gagal menghapus data pelanggan");
        setErrorDialogOpen(true);
        return;
      }
      fetchcustomers();
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      setErrorDialogOpen(true);
    }
  };
  
  const columns: ColumnDef<customers>[] = [
    { accessorKey: "id", header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "address", header: "Alamat" },
    { accessorKey: "phone_number", header: "Nomer Telepon" },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => openModal(row.original, true)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => handleDelete(row.original.id)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 border-b-2">Data Pelanggan</h1>
      <DataTable columns={columns} data={customers} onAdd={openModal}/>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit pelanggan" : "Tambah pelanggan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nama Pelanggan" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Alamat" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <Input placeholder="Nomer Telepon" value={phone_number} onChange={(e) => setPhone_number(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>Tutup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
