"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { httpGet, httpPost } from "@/lib/http";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Product = {
  id: number;
  product_name: string;
  price: number;
  stock: number;
};

type CartItem = {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  stock: number;
};

type Customers = {
  id: number;
  name: string;
  address: string;
  phone_number: string;
};

export default function TransactionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [total, setTotal] = useState(0);
  const [subTotal, setSubTotal] = useState<{ [key: number]: number }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [Message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
      cart.forEach((item) => {
          setSubTotal((prevSubTotal) => ({
              ...prevSubTotal,
              [item.id]: item.price * item.quantity,
            }));          
        });
        console.log(subTotal)
    setTotal(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cart]);

  const fetchProducts = async () => {
    const response = await httpGet("/api/product");
    const data = await response.json();
    setProducts(data.data || []);
  };

  const fetchCustomers = async () => {
    const response = await httpGet("/api/customer");
    const data = await response.json();
    setCustomers(data.data || []);
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    delete subTotal[productId]
  };

  const handleCheckout = async () => {
    if (!selectedCustomer || cart.length === 0) return;
    setLoading(true);

    const payload = {
      customer_id: Number(selectedCustomer),
      total_price: total,
      sale_date: new Date().toISOString().split("T")[0],
      items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity, sub_total: subTotal[item.id] })),
    };

    try {
      const response = await httpPost("/api/transaction", payload);
      const responData = await response.json();
      if (!response.ok) {
        setMessage(responData.error);
        return
      }
      setCart([]);
      setMessage("Transaksi berhasil")
      setDialogOpen(true);
    } catch (error) {
      console.error("Transaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6 border-b-2">Transaksi</h1>
      <div className="flex gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Produk</h2>
          <Input
            placeholder="🔍 Cari produk..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="mb-4"
          />
        
          <div className="grid grid-cols-2 gap-4">
            {products
              .filter((product) => product.product_name.toLowerCase().includes(searchProduct.toLowerCase()))
              .map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md" onClick={() => {
                  if (product.stock === 0) return;
                  addToCart(product)
                }
                }>
                  <CardHeader>
                    <CardTitle>{product.product_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">Rp {formatPrice(product.price)}</p>
                    <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                    <Button className="mt-2 w-full">Tambahkan ke keranjang</Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
        <div className="w-px bg-gray-300"></div>
        <div className="w-1/3 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🛒 Keranjang</h2>

          <Select onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="🔽 Pilih pelanggan" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-lg">
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()} className="p-2 flex items-center space-x-6">
                  <span>{customer.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kuantitas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      min="1"
                      max={item.stock}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 text-center"
                    />
                  </TableCell>
                  <TableCell>Rp {formatPrice(subTotal[item.id])}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="text-red-500" size={20} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-xl font-bold">Total: Rp {formatPrice(total)}</div>
          <Button className="mt-4 w-full" onClick={handleCheckout} disabled={!selectedCustomer || cart.length === 0}>
            {loading ? "Memproses..." : "Selesaikan pembelian"}
          </Button>
        </div>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Info</AlertDialogTitle>
            <AlertDialogDescription>{Message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>Tutup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
