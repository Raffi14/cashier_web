"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash, ArrowUp, ArrowDown } from "lucide-react";
import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/http";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

type Product = {
  id: number;
  product_name: string;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"product_name" | "price" | "id" | "stock" |null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  
  const fetchProducts = async () => {
    const response = await httpGet("/api/product");
    const data = await response.json();
    setProducts(data.data || []);
    setFilteredProducts(data.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let updatedProducts = [...products];

    if (search) {
      updatedProducts = updatedProducts.filter((product) =>
        product.product_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy) {
      updatedProducts.sort((a, b) => {
        if (sortBy === "product_name") {
          return sortAsc ? a.product_name.localeCompare(b.product_name) : b.product_name.localeCompare(a.product_name);
        } else if (sortBy === "price") {
          return sortAsc ? a.price - b.price : b.price - a.price;
        } else if (sortBy === "id") {
          return sortAsc ? a.id - b.id : b.id - a.id;
        } else if (sortBy === "stock") {
          return sortAsc ? a.stock - b.stock : b.stock - a.stock;
        }
        return 0;
      });
    }

  setFilteredProducts(updatedProducts);
  }, [search, sortBy, sortAsc, products]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditProduct(product);
      setName(product.product_name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
    } else {
      setEditProduct(null);
      setName("");
      setPrice("");
      setStock("");
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
      return;
    }

    setLoading(true);

    try {
      let response;
      if (editProduct) {
        response = await httpPut(`/api/product/${editProduct.id}`, {
          product_name: name,
          price: parseFloat(price),
          stock: parseInt(stock),
        });
      } else {
        response = await httpPost("/api/product", {
          product_name: name,
          price: parseFloat(price),
          stock: parseInt(stock),
        });
      }

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
  

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 border-b-2">Manage Products</h1>
      <div className="flex">
      <Input
        className="mb-4"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button onClick={() => openModal()} className="mb-4">+ Add Product</Button>
      </div>

      <Table className="border bg-white rounded-lg shadow">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[100px] cursor-pointer" onClick={() => { setSortBy("id"); setSortAsc(!sortAsc); }}>
              Id {sortBy === "id" && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => { setSortBy("product_name"); setSortAsc(!sortAsc); }}>
              Name {sortBy === "product_name" && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => { setSortBy("price"); setSortAsc(!sortAsc); }}>
              Price {sortBy === "price" && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </TableHead>
            <TableHead  className="cursor-pointer" onClick={() => { setSortBy("stock"); setSortAsc(!sortAsc); }}>
              Stock {sortBy === "stock" && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
          filteredProducts.length > 0 ?
          Array.isArray(filteredProducts) && filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.product_name}</TableCell>
              <TableCell>Rp {Math.floor(product.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openModal(product)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          )) : 
          <TableRow>
          <TableCell colSpan={5} className="text-center py-4">No products available</TableCell>
          </TableRow>
          }
        </TableBody>
      </Table>
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
