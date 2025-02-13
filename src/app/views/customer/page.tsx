"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const data = [
    { id: 1, name: "Contoh Nama", email: "contoh@email.com" }
  ];

  return (
    <Card className="p-6 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Daftar Pelanggan</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="mb-4 flex items-center gap-2" onClick={() => { setEditingCustomer(null); setOpen(true); }}>
          <Plus size={16} /> Tambah Pelanggan
        </Button>
        <Table className="border rounded-lg overflow-hidden">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50">
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="text-right">
                  <Button className="mr-2" size="icon" variant="ghost">
                    <Edit size={16} />
                  </Button>
                  <Button size="icon" variant="destructive">
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger />
        <DialogContent className="p-6">
          <DialogTitle>{editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
          <DialogDescription>Isi formulir di bawah ini untuk {editingCustomer ? "memperbarui" : "menambahkan"} pelanggan.</DialogDescription>
          <div className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input placeholder="Nama" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={() => setOpen(false)}>{editingCustomer ? "Update" : "Tambah"}</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
