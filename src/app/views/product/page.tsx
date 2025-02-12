"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash } from "lucide-react";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Laptop", price: 1200, stock: 7 },
    { id: 2, name: "Smartphone", price: 800, stock:9 },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const openModal = (product?: Product) => {
    if (product) {
      setEditProduct(product);
      setName(product.name);
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

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 border-b-2">Manage Products</h1>
      <Button onClick={() => openModal()} className="mb-4">+ Add Product</Button>
      <Table className="border">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openModal(product)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-md p-6">
          <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </VisuallyHidden>
          </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              <Input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          <DialogFooter>
            <Button>{editProduct ? "Save Changes" : "Add Product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
