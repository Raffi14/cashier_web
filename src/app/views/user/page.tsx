"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: number;
  full_name: string;
  role: string;
  username: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    open: boolean;
  }>({ id: 0, open: false });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length > 0 && newPassword.length < 8) {
      setPasswordError("Kata sandi harus memiliki setidaknya 8 karakter");
    } else {
      setPasswordError("");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await httpGet("/api/user");
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const openModal = (user?: User, isOpen?: boolean) => {
    setEditUser(user || null);
    setFullName(user?.full_name || "");
    setRole(user?.role || "");
    setUsername(user?.username || "");
    setModalOpen(true);
    setIsEditing(isOpen || false);
  };

  const handleSubmit = async () => {
    if (!fullName || !role || !username) return;
    if (password.trim() && password.length < 8) {
      setPasswordError("Kata sandi harus memiliki setidaknya 8 karakter");
      return;
    }
    setLoading(true);

    try {
      const isEditing = !!editUser && !!editUser.id;
      const endpoint = isEditing ? `/api/user/${editUser.id}` : "/api/user";
      const method = isEditing ? httpPut : httpPost;

      const data: {
        full_name: string;
        role: string;
        username: string;
        password?: string;
      } = {
        full_name: fullName,
        role,
        username,
      };

      if (password.trim()) {
        data.password = password;
      }
      const response = await method(endpoint, data);
      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(responseData.error);
        setErrorDialogOpen(true);
        return;
      }

      fetchUsers();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await httpDelete(`/api/user/${id}`);
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to delete user");
        setErrorDialogOpen(true);
        return;
      }
      fetchUsers();
    } catch (error) {
      setErrorMessage("Unexpected error occurred");
      setErrorDialogOpen(true);
    } finally {
      setConfirmDelete({ id: 0, open: false });
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "full_name", header: "Nama Lengkap" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "username", header: "Nama Pengguna" },
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
          <Button
            variant="destructive"
            size="icon"
            onClick={() =>
              setConfirmDelete({ id: row.original.id, open: true })
            }
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full mx-auto h-screen overflow-auto scrollbar-hide">
      <DataTable columns={columns} data={users} onAdd={openModal} type="user" />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent aria-describedby="input" className="w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Pengguna" : "Tambah Pengguna"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nama Lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="petugas">Petugas</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Nama Pengguna"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              placeholder="Password"
              onChange={handlePasswordChange}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
        <AlertDialog
          open={confirmDelete.open}
          onOpenChange={(open) =>
            setConfirmDelete({ id: confirmDelete.id, open })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus pengguna ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete({ id: 0, open: false })}
              >
                Batal
              </Button>
              <AlertDialogAction onClick={() => handleDelete(confirmDelete.id)}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
