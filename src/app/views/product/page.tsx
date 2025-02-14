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

type Product = {
  id: number;
  product_name: string;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  
  const fetchProducts = async () => {
    const response = await httpGet("/api/product");
    const data = await response.json();
    setProducts(data.data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product?: Product) => {
      setEditProduct(product || null);
      setName(product?.product_name || "");
      setPrice(String(product?.price ?? ""));
      setStock(String(product?.stock ?? ""));
      setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
      return;
    }

    setLoading(true);

    try {
      const isEditing = !!editProduct && !!editProduct.id;
      const endpoint = isEditing ? `/api/product/${editProduct.id}` : "/api/product";
      const method = isEditing ? httpPut : httpPost;
      const response = await method(endpoint, { product_name: name, price, stock });

      const responseData = await response.json();
      if (!response.ok) {
        setErrorMessage(responseData.error);
        setErrorDialogOpen(true);
        return;
      }

      fetchProducts();
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await httpDelete(`/api/product/${id}`);
      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to delete product");
        setErrorDialogOpen(true);
        return;
      }
      fetchProducts();
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      setErrorDialogOpen(true);
    }
  };
  
  const columns: ColumnDef<Product>[] = [
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
    { accessorKey: "product_name", header: "Name" },
    { accessorKey: "price", header: () => <div>Price</div>,
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);

        return <div className="font-medium">{formatted}</div>
    },
  },
    { accessorKey: "stock", header: "stock" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => openModal(row.original)}>
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
      <h1 className="text-3xl font-bold mb-6 border-b-2">Manage Products</h1>
      <DataTable columns={columns} data={products} onAdd={openModal}/>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Price" type="number" value={Math.floor(parseInt(price)) || ""} onChange={(e) => setPrice(e.target.value)} required />
            <Input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : editProduct ? "Save Changes" : "Add Product"}
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
