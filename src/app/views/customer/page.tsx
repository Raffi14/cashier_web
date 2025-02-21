"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/http";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
  const [dialogOpen, setdialogOpen] = useState(false);
  const [message, setmessage] = useState("");
  const [editcustomers, setEditcustomers] = useState<customers | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [rawNumber, setRawNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

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
    if (customers?.phone_number) {
      const formattedPhone = formatPhoneNumber(
        customers.phone_number,
        false
      ).formatted;
      setRawNumber(formattedPhone);
      setPhone_number(customers.phone_number);
    } else {
      setRawNumber("");
      setPhone_number("");
    }
    setModalOpen(true);
    setIsEditing(isOpen || false);
  };

  const handleSubmit = async () => {
    if (!name || !address || !phone_number) return;
    if (phone_number.length < 12) {
      setError("Nomor telepon harus minimal 11 digit!");
      return;
    } else {
      setError("");
    }
    setLoading(true);
    try {
      const endpoint = isEditing
        ? `/api/customer/${editcustomers?.id}`
        : "/api/customer";
      const method = isEditing ? httpPut : httpPost;
      const response = await method(endpoint, { name, address, phone_number });
      const responseData = await response.json();

      if (!response.ok) {
        setmessage(responseData.error);
        setdialogOpen(true);
        return;
      }
      
      setmessage(responseData.message);
      setdialogOpen(true);
      fetchcustomers();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string, isDeleting: boolean) => {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("62")) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }

    let formatted = `+62 ${cleaned}`;
    if (!isDeleting) {
      formatted = `+62 ${cleaned
        .replace(/(\d{3})(\d{4})(\d+)?/, "$1-$2-$3")
        .trim()}`;
    }

    return { formatted, cleaned: "0" + cleaned };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace("+62 ", "");
    const isDeleting =
      e.nativeEvent instanceof InputEvent &&
      e.nativeEvent.inputType === "deleteContentBackward";

    const { formatted, cleaned } = formatPhoneNumber(input, isDeleting);

    setRawNumber(formatted);
    setPhone_number(cleaned);
  };

  // const handleDelete = async (id: number) => {
  //   try {
  //     const response = await httpDelete(`/api/customer/${id}`);
  //     if (!response.ok) {
  //       const data = await response.json();
  //       setmessage(data.error || "Gagal menghapus data pelanggan");
  //       setdialogOpen(true);
  //       return;
  //     }
  //     fetchcustomers();
  //   } catch (error) {
  //     setmessage("An unexpected error occurred");
  //     setdialogOpen(true);
  //   } finally {
  //     setConfirmDelete({ id: 0, open: false });
  //   }
  // };

  const columns: ColumnDef<customers>[] = [
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
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "address", header: "Alamat" },
    {
      accessorKey: "phone_number",
      header: "Nomer Telepon",
      cell: ({ row }) => {
        const formatPhoneNumber = (phone: string) => {
          let cleaned = phone.replace(/\D/g, "");

          if (cleaned.startsWith("62")) {
            cleaned = cleaned.slice(2);
          } else if (cleaned.startsWith("0")) {
            cleaned = cleaned.slice(1);
          }

          return `+62 ${cleaned
            .replace(/(\d{3})(\d{4})(\d+)?/, "$1-$2-$3")
            .trim()}`;
        };

        return formatPhoneNumber(row.original.phone_number);
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => openModal(row.original, true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {/* <Button variant="destructive" size="icon" onClick={() => setConfirmDelete({ id: row.original.id, open: true })}>
            <Trash className="w-4 h-4" />
          </Button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full mx-auto h-screen overflow-auto scrollbar-hide">
      <DataTable
        columns={columns}
        data={customers}
        onAdd={openModal}
        type="pelanggan"
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          aria-describedby="dialog-description"
          className="w-full max-w-md p-6"
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit pelanggan" : "Tambah pelanggan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700"
            >
              Nama Pelanggan
            </label>
            <Input
              id="customerName"
              placeholder="Nama Pelanggan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customerAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat
            </label>
            <Input
              id="customerAddress"
              placeholder="Alamat"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="customerPhone"
              className="block text-sm font-medium text-gray-700"
            >
              Nomer Telepon
            </label>
            <Input
              id="customerPhone"
              placeholder="Nomer Telepon"
              value={rawNumber}
              onChange={handleInputChange}
              maxLength={17}
              required
              className="w-full"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full"
            >
              {loading
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <AlertDialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ id: confirmDelete.id, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus pengguna ini?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete({ id: 0, open: false })}>Batal</Button>
            <AlertDialogAction onClick={() => handleDelete(confirmDelete.id)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
      <AlertDialog open={dialogOpen} onOpenChange={setdialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>info</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setdialogOpen(false)}>
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
