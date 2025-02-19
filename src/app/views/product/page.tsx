"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash, ArrowUp, ArrowDown, ArrowUpDown, Boxes, Package, XCircle } from "lucide-react";
import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/http";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Product = {
  id: number;
  product_name: string;
  price: number;
  stock: number;
  is_active: "active" | "inactive";
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; open: boolean }>({ id: 0, open: false });

  const fetchProducts = async () => {
    const response = await httpGet("/api/product");
    const data = await response.json();
    setProducts(data.data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
  const outOfStockCount = products.filter((product) => product.stock === 0).length;

  const openModal = (product?: Product, isOpen? : boolean) => {
      setEditProduct(product || null);
      setPrice(product?.price ?? 0);
      setName(product?.product_name || "");
      const price = product?.price !== undefined ? product.price.toString() : "";
      setFormattedPrice(formatted(price).toString());
      setStock(String(product?.stock ?? ""));
      setModalOpen(true);
      setIsEditing(isOpen || false)
    };
    
    const handleSubmit = async () => {
      if (!name || !price || !stock) {
        return;
      }
      
      setLoading(true);
      
    try {
      const endpoint = isEditing ? `/api/product/${editProduct?.id}` : "/api/product";
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
      setFormattedPrice('');
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
        setErrorMessage(data.error || "Gagal menghapus data produk");
        setErrorDialogOpen(true);
        return;
      }
      fetchProducts();
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      setErrorDialogOpen(true);
    } finally {
      setConfirmDelete({ id: 0, open: false });
    }
  };

  const handleFormatted = (value: string) => {
    let rawValue = value.replace(/[^0-9]/g, "");
    const num = formatted(value);
    setPrice(parseInt(rawValue));
    setFormattedPrice(num);
  };

  const formatted = (value: string): string => {
    let rawValue = value.replace(/[^0-9]/g, "");
    const parts = rawValue.split("."); 
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = parts.length > 1 ? "." + parts[1] : "";
    return integerPart + decimalPart;
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
    { accessorKey: "product_name", header: "Nama" },
    { accessorKey: "price", header: () => <div>Harga</div>,
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
    {
      accessorKey: "stock",
      header: "Stok",
      cell: ({ cell }) => {
        const stock = cell.getValue<number>();
        return (
          <span className={stock === 0 ? "text-red-500" : ""}>
            {stock}
          </span>
        );
      },
    },    
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => openModal(row.original, true)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setConfirmDelete({ id: row.original.id, open: true })}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 w-full mx-auto h-screen overflow-auto scrollbar-hide">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />Total Produk
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalProducts}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Boxes className="w-5 h-5 text-green-500" />Total Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalStock}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />Produk Habis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{outOfStockCount}</CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={products} onAdd={openModal} type="produk"/>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent aria-describedby="input" className="w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          </DialogHeader>
          <div>
            <Input placeholder="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} required disabled={isEditing}/>
            <div className="flex items-center px-3 py-2">
              <span className="text-gray-500 mb-1">Rp</span>
              <Input
                className="border focus:ring-0 ml-2 flex-1"
                placeholder="Harga"
                type="text"
                value={formattedPrice}
                onChange={(e) => handleFormatted(e.target.value)}
                required
              />
            </div>
            <Input placeholder="Stok" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ id: confirmDelete.id, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus produk ini?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete({ id: 0, open: false })}>Batal</Button>
            <AlertDialogAction onClick={() => handleDelete(confirmDelete.id)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Info</AlertDialogTitle>
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
