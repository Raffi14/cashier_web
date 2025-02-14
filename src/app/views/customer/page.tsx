"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash, ArrowUp, ArrowDown } from "lucide-react";
import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/http";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

type customers = {
  id: number;
  name: string;
  address: number;
  phone_number: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<customers[]>([]);
  const [filteredcustomers, setFilteredCustomers] = useState<customers[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editcustomers, setEditcustomers] = useState<customers | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "address" | "id" | "phone_number" |null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  
  const fetchcustomers = async () => {
    const response = await httpGet("/api/customer");
    const data = await response.json();
    setCustomers(data.data || []);
    setFilteredCustomers(data.data);
  };

  useEffect(() => {
    fetchcustomers();
  }, []);

  useEffect(() => {
    let updatedcustomers = [...customers];

    if (search) {
      updatedcustomers = updatedcustomers.filter((customers) =>
        customers.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy) {
      updatedcustomers.sort((a, b) => {
        if (sortBy === "name") {
          return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortBy === "address") {
          return sortAsc ? a.address - b.address : b.address - a.address;
        } else if (sortBy === "id") {
          return sortAsc ? a.id - b.id : b.id - a.id;
        } else if (sortBy === "phone_number") {
          return sortAsc ? a.phone_number - b.phone_number : b.phone_number - a.phone_number;
        }
        return 0;
      });
    }

  setFilteredCustomers(updatedcustomers);
  }, [search, sortBy, sortAsc, customers]);

  const openModal = (customers?: customers) => {
    if (customers) {
      setEditcustomers(customers);
      setName(customers.name);
      setAddress(customers.address.toString());
      setPhone_number(customers.phone_number.toString());
    } else {
      setEditcustomers(null);
      setName("");
      setAddress("");
      setPhone_number("");
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !address || !phone_number) {
      return;
    }

    setLoading(true);

    try {
      let response;
      if (editcustomers) {
        response = await httpPut(`/api/customer/${editcustomers.id}`, {
          name: name,
          address: address,
          phone_number: phone_number,
        });
      } else {
        response = await httpPost("/api/customer", {
          name: name,
          address: address,
          phone_number: phone_number,
        });
      }

      const responseData = await response.json();
      if (!response.ok) {
        setErrorMessage(responseData.error);
        setErrorDialogOpen(true);
        return;
      }

      fetchcustomers();
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await httpDelete(`/api/customer/${id}`);
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to delete customers");
        setErrorDialogOpen(true);
        return;
      }
      fetchcustomers();
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      setErrorDialogOpen(true);
    }
  };
  

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 border-b-2">Manage customers</h1>
      <div className="flex gap-4">
      <Input
        className="mb-4"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button onClick={() => openModal()} className="mb-4">+ Add customers</Button>
      </div>

      <Table className="border bg-white rounded-lg shadow w-full">
        <TableHeader>
          <TableRow className="bg-gray-100 h-[50px]">
            <TableHead className="cursor-pointer text-left w-[10px]" onClick={() => { setSortBy("id"); setSortAsc(!sortAsc); }}>
              Id {sortBy === "id" && (sortAsc ? <ArrowUp size={14} className="text-left" /> : <ArrowDown size={14} className="text-left"/>)}
            </TableHead>
            <TableHead className="cursor-pointer text-center w-[80px]" onClick={() => { setSortBy("name"); setSortAsc(!sortAsc); }}>
              Name {sortBy === "name" && (sortAsc ? <ArrowUp size={14} className="text-center"/> : <ArrowDown size={14} className="text-center"/>)}
            </TableHead>
            <TableHead className="cursor-pointer text-center w-[100px]" onClick={() => { setSortBy("address"); setSortAsc(!sortAsc); }}>
              address {sortBy === "address" && (sortAsc ? <ArrowUp size={14} className="text-center"/> : <ArrowDown size={14} className="text-center"/>)}
            </TableHead>
            <TableHead  className="cursor-pointer text-center w-[100px]" onClick={() => { setSortBy("phone_number"); setSortAsc(!sortAsc); }}>
              phone_number {sortBy === "phone_number" && (sortAsc ? <ArrowUp size={14} className="text-center"/> : <ArrowDown size={14} className="text-center"/>)}
            </TableHead>
            <TableHead className="text-center w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
          filteredcustomers.length > 0 ?
          Array.isArray(filteredcustomers) && filteredcustomers.map((customers) => (
            <TableRow key={customers.id}>
              <TableCell className="text-left">{customers.id}</TableCell>
              <TableCell className="text-center">{customers.name}</TableCell>
              <TableCell className="text-center">{customers.address}</TableCell>
              <TableCell className="text-center">{customers.phone_number}</TableCell>
              <TableCell className="flex gap-2 text-center justify-center">
                <Button variant="outline" size="icon" onClick={() => openModal(customers)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(customers.id)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          )) : 
          <TableRow className="h-[50px]">
            <TableCell colSpan={5} className="text-center py-4">No customers available</TableCell>
          </TableRow>
          }
        </TableBody>
      </Table>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{editcustomers ? "Edit customers" : "Add customers"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="customers Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <Input placeholder="phone_number" value={phone_number} onChange={(e) => setPhone_number(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editcustomers ? "Save Changes" : "Add Customers"}
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
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
