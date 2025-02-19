"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { httpGet, httpPost } from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import React from "react";

type Product = {
  id: number;
  product_name: string;
  price: number;
  stock: number;
  is_active: "active" | "inactive";
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
  const router = useRouter();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [rawNumber, setRawNumber] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    address: "",
    phone_number: "",
  });
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState("");
  const [productStock, setProductStock] = useState<{ [key: number]: number }>(
    Object.fromEntries(products.map((product) => [product.id, product.stock]))
  );

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
    newCustomer.phone_number = cleaned;
  };

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
    setTotal(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cart]);

  useEffect(() => {
    if (products.length > 0) {
      setProductStock(
        Object.fromEntries(
          products.map((product) => [product.id, product.stock])
        )
      );
    }
  }, [products]);

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

  const handleSubmit = async () => {
    if (!newCustomer.name || !newCustomer.address || !newCustomer.phone_number)
      return;
    if (newCustomer.phone_number.length < 12) {
      setError("Nomor telepon harus minimal 11 digit!");
      return;
    } else {
      setError("");
    }
    try {
      const response = await httpPost("/api/customer", newCustomer);
      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(responseData.error);
        setErrorDialogOpen(true);
        return;
      }

      fetchCustomers();
      setCustomerDialogOpen(false);
      setErrorMessage(responseData.message);
      setErrorDialogOpen(true);
      setNewCustomer({ name: "", address: "", phone_number: "" });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === product.id) {
            if (item.quantity >= product.stock) {
              return item;
            }
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        })
        .concat(
          prevCart.find((item) => item.id === product.id)
            ? []
            : [{ ...product, quantity: 1 }]
        );
    });
    setProductStock((prevStock) => ({
      ...prevStock,
      [product.id]: Math.max(0, (prevStock[product.id] || 0) - 1),
    }));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === productId) {
          const originalStock =
            products.find((p) => p.id === productId)?.stock || 0;
          const currentStock = productStock[productId] ?? originalStock;
          const quantityChange = newQuantity - item.quantity;
          if (quantityChange > 0 && currentStock < quantityChange) {
            return item;
          }
          setProductStock((prevStock) => ({
            ...prevStock,
            [productId]: Math.max(0, currentStock - quantityChange),
          }));
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const removedItem = prevCart.find((item) => item.id === productId);
      if (!removedItem) return prevCart;
      const originalProduct = products.find(
        (product) => product.id === productId
      );
      if (!originalProduct) return prevCart;
      setProductStock((prevStock) => ({
        ...prevStock,
        [productId]: originalProduct.stock,
      }));

      return prevCart.filter((item) => item.id !== productId);
    });
    setSubTotal((prevSubTotal) => {
      const newSubTotal = { ...prevSubTotal };
      delete newSubTotal[productId];
      return newSubTotal;
    });
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomerName =
    customers.find((customer) => customer.id === Number(selectedCustomer))
      ?.name || "pelanggan";

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    const payload = {
      customer_id: selectedCustomer ? Number(selectedCustomer) : null,
      total_price: total,
      sale_date: new Date().toISOString().split("T")[0],
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        sub_total: subTotal[item.id],
      })),
    };

    try {
      const response = await httpPost("/api/transaction", payload);
      const responData = await response.json();
      if (!response.ok) {
        setMessage(responData.error);
        return;
      }
      setCart([]);
      setMessage("Transaksi berhasil");
      setDialogOpen(true);
      fetchProducts();
      setTransactionSuccess(true);
      setSearchTerm("");
    } catch (error) {
      console.error("Transaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTransactionHistory = () => {
    router.push("/views/history");
  };

  return (
    <div className="p-4 pt-2 w-full mx-auto h-screen overflow-hidden scrollbar-hide">
      <div className="flex max-h-full gap-6 h-full pb-28">
        <div className="flex-1 pb-12">
          <h2 className="text-xl font-bold mb-4">Produk</h2>
          <Input
            placeholder="Cari produk..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="mb-4"
          />
          <div className="flex-1 max-h-full overflow-y-auto scrollbar-hide pr-2">
            <div className="grid grid-cols-2 gap-4">
              {products
                .filter((product) =>
                  product.product_name
                    .toLowerCase()
                    .includes(searchProduct.toLowerCase())
                )
                .map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer hover:shadow-md ${
                      productStock[product.id] === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => {
                      if (product.stock === 0) return;
                      addToCart(product);
                    }}
                  >
                    <CardHeader>
                      <CardTitle>{product.product_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        Rp {formatPrice(product.price)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stok: {productStock[product.id]}
                      </p>
                      <Button
                        className="mt-2 w-full"
                        disabled={productStock[product.id] === 0}
                      >
                        Tambahkan ke keranjang
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
        <div className="w-px bg-gray-300"></div>
        <div className="w-1/3 flex flex-col h-full">
          <h2 className="text-xl font-bold mb-4">🛒 Keranjang</h2>
          <div className="relative">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari pelanggan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 50)}
                className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg p-3 shadow-sm focus:ring-1 focus:ring-gray-400"
              />
              <button
                className="h-10 w-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-lg bg-white hover:bg-gray-100 shadow-sm transition-all"
                onClick={() => setCustomerDialogOpen(true)}
              >
                <span className="text-xl font-semibold">+</span>
              </button>
            </div>
            {showDropdown && filteredCustomers.length > 0 && (
              <div className="absolute w-full bg-white shadow-lg rounded-md mt-1 z-10 max-h-40 overflow-auto scrollbar-hide">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2 pl-4 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => {
                      setSelectedCustomer(customer.id.toString());
                      setSearchTerm(customer.name);
                      setShowDropdown(false);
                    }}
                  >
                    {customer.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="scrollbar-hide overflow-y-auto">
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
                        onChange={(e) => {
                          let newQuantity = parseInt(e.target.value) || 1;
                          updateQuantity(item.id, newQuantity);
                        }}
                        className="w-16 text-center"
                      />
                    </TableCell>
                    <TableCell>Rp {formatPrice(subTotal[item.id])}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="text-red-500" size={20} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-xl font-bold">
            Total: Rp {formatPrice(total)}
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={cart.length === 0}
          >
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
            <AlertDialogAction onClick={() => setDialogOpen(false)}>
              Tutup
            </AlertDialogAction>
            {transactionSuccess && (
              <AlertDialogAction onClick={navigateToTransactionHistory}>
                Lihat Riwayat
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembelian</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <div className="mb-2">
                  <strong>Pelanggan:</strong> {selectedCustomerName}
                </div>
                <div className="mb-2">
                  <strong>Total:</strong> Rp {formatPrice(total)}
                </div>
                <div className="mb-2">
                  <strong>Produk yang dibeli:</strong>
                </div>
                <ul className="list-disc list-inside">
                  {cart.map((item) => (
                    <li key={item.id}>
                      {item.product_name} x {item.quantity} - Rp{" "}
                      {formatPrice(subTotal[item.id])}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex justify-end space-x-2">
            <AlertDialogAction onClick={() => setConfirmDialogOpen(false)}>
              Batal
            </AlertDialogAction>
            <AlertDialogAction onClick={handleCheckout}>
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={customerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tambah Pelanggan</AlertDialogTitle>
            <AlertDialogDescription>
              Isi informasi pelanggan baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Nama Pelanggan"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            required
          />
          <Input
            placeholder="Alamat"
            value={newCustomer.address}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, address: e.target.value })
            }
          />
          <div className="flex flex-col">
            <Input
              placeholder="Nomer Telepon"
              value={rawNumber}
              onChange={handleInputChange}
              maxLength={17}
              required
              className="mb-0"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setCustomerDialogOpen(false)}>
              Batal
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSubmit}>Tambah</AlertDialogAction>
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
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
