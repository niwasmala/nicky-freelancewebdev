'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProductInterface {
  id?: number;
  name: string;
  photo?: string;
  price: number;  
}

interface CartInterface extends ProductInterface {
  quantity: number;
}

interface OrderInterface {
  id?: number;
  order_number?: number;
  total_price: number;
  buyer_money: number;
  change_money: number;
}

interface OrderItemInterface {
  id?: number;
  product_id: number;
  name: string;
  photo?: string;
  price: number;
  quantity: number;
  total_price: number;
}

export default function Home() {
  const [ tab, setTab ] = useState<string>('transaction');
  const [ subtab, setSubTab ] = useState<string>('list');

  const [ modalCharge, setModalCharge ] = useState<boolean>(false);
  const [ modalBill, setModalBill ] = useState<boolean>(false);
  const [ modalOrder, setModalOrder ] = useState<boolean>(false);

  const [ products, setProducts ] = useState<ProductInterface[]>([] as ProductInterface[]);
  const [ cart, setCart ] = useState<CartInterface[]>([] as CartInterface[]);
  const [ buyerMoney, setBuyerMoney ] = useState<number>(0 as number);
  const [ product, setProduct ] = useState<ProductInterface>({name: '', price: 0} as ProductInterface);
  const [ orderNumber, setOrderNumber ] = useState<string>("");

  useEffect(() => {
    if (modalCharge) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [ modalCharge ]);

  const loadBill = () => {
    const localCart = (JSON.parse(localStorage.getItem('alan-resto-cart') ?? '[]') ?? []) as CartInterface[];

    setCart(localCart);
  }

  const saveBill = () => {
    localStorage.setItem('alan-resto-cart', JSON.stringify(cart));

    setModalBill(true);
  }

  const printBill = () => {
    var mywindow = window.open('', 'PRINT', 'height=600,width=400');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('<link rel="stylesheet" href="/_next/static/css/app/layout.css">');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(document.getElementById("bill").innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close();
    mywindow.focus();

    mywindow.print();
    // mywindow.close();

    return true;
  };

  const clearCart = () => {
    setCart([] as CartInterface[]);
    localStorage.setItem('alan-resto-cart', JSON.stringify([]));
  }

  useEffect(() => {
    loadBill();
  }, []);

  const addToCart = (item: ProductInterface) => {
    let isExist = false;
    let newCart = [...cart];

    newCart.forEach((cartItem: CartInterface, index: number) => {
      if (cartItem.id === item.id) {
        isExist = true;

        newCart[index].quantity += 1;
      }
    });

    if (!isExist) {
      newCart.push({
        ...item,
        quantity: 1,
      });
    }

    setCart(newCart);
  }

  const fetchProducts = async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "products");
    const products = await response.json();
    
    setProducts(products);
  }

  const createProduct = async () => {
    const {id, ...data} = product;

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "products", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    setProduct({
      id: null,
      name: '',
      photo: null,
      price: 0,
    });

    setSubTab('list');

    fetchProducts();
  }

  const createOrder = async () => {
    const total_price = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const buyer_money = parseInt(buyerMoney);

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "orders", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        total_price,
        buyer_money,
        change_money: buyer_money - total_price,
        items: cart.map(item => {
          return {
            product_id: item.id,
            name: item.name,
            photo: item.photo,
            price: item.price,
            quantity: item.quantity,
            total_price: item.quantity * item.price,
          } as OrderItemInterface;
        }),
      }),
    });
    const result = await response.json();

    setBuyerMoney(0);
    setModalCharge(false);
    setModalOrder(true);
    setOrderNumber(result.order_number);
    clearCart();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main>
      <div className="bg-blue-400 text-white w-full">
        <div className="max-w-5xl mx-auto py-3 flex flex-row gap-2">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <div className="">
            Alan Resto
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md w-full">
        <div className="max-w-5xl mx-auto flex flex-row gap-4">
          <div onClick={() => { setTab('food'); setSubTab('list') }} className={"cursor-pointer text-sm font-semibold py-3 px-5 border-b-2 " + (tab === 'food' ? "text-blue-400 border-blue-400" : 'border-white')}>
            Food
          </div>
          <div onClick={() => setTab('transaction')} className={"cursor-pointer text-sm font-semibold py-3 px-5 border-b-2 " + (tab === 'transaction' ? "text-blue-400 border-blue-400" : 'border-white')}>
            Transaction
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto py-4">
        {tab === 'food' && (
          <>
            {subtab === 'list' && (              
              <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-600">
                  Tambahkan menu makanan yang ada di resto
                </div>
                <div className="bg-white shadow-md w-full p-6 flex flex-col gap-4">
                  <button onClick={() => setSubTab('add')} className="bg-blue-400 text-white py-2 w-36 text-sm">
                    + Tambah Menu
                  </button>

                  <table className="w-full">
                    <thead className="bg-gray-200 text-gray-900 text-sm">
                      <tr>
                        <td className="p-2 w-12">
                          #
                        </td>
                        <td className="p-2">
                          Nama
                        </td>
                        <td className="p-2 w-64">
                          Foto
                        </td>
                        <td className="p-2">
                          Harga
                        </td>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-100 text-gray-900 text-sm">
                      {products.map((item: ProductInterface, index: number) => {
                        return (
                          <tr key={index}>
                            <td className="p-2">
                              {index+1}
                            </td>
                            <td className="p-2">
                              {item.name}
                            </td>
                            <td className="p-2">
                              <div className="w-24 h-16 bg-gray-200">
                              </div>
                            </td>
                            <td className="p-2">
                              {new Intl.NumberFormat("id-ID", {
                                currency: "IDR",
                                style: "currency",
                                minimumFractionDigits: 0,
                              }).format(item.price)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subtab === 'add' && (
              <div className="bg-white shadow-md py-6 px-4">
                <div className="font-bold text-blue-400">
                  Tambahkan Menu
                </div>
                <div className="flex flex-col gap-4 py-8">
                  <div className="flex flex-col gap-2">
                    <label for="name" className="text-sm text-gray-600">
                      Nama Menu
                    </label>
                    <input value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} type="text" id="name" name="name" className="px-4 py-2 h-12 border-gray-200 border" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label for="photo" className="text-sm text-gray-600">
                      Foto Menu
                    </label>
                    <input type="file" id="photo" name="photo" className="px-4 py-2 h-12 border-gray-200 border" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label for="price" className="text-sm text-gray-600">
                      Harga Menu
                    </label>
                    <input value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})} type="text" id="price" name="price" className="px-4 py-2 h-12 border-gray-200 border" />
                  </div>
                </div>  
                <div className="flex flex-row-reverse">
                  <button onClick={() => createProduct()} className="bg-green-700 text-white py-2 px-4">
                    Simpan
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'transaction' && (
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <div className="grow grid grid-cols-3 gap-4">
                {products.map((item: ProductInterface, index: number) => {
                  return (
                    <div key={index} onClick={() => addToCart(item)} className="cursor-pointer flex flex-col shadow-md bg-white w-full">                
                      <div className="w-full h-32 bg-gray-100">
                        
                      </div>
                      <div className="p-3 text-center">
                        <div className="text-black text-sm font-semibold">
                          {item.name}
                        </div>
                        <div className="text-blue-400 text-sm font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            currency: "IDR",
                            style: "currency",
                            minimumFractionDigits: 0,
                          }).format(item.price)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="w-96">
              <div className="bg-white shadow-md p-4">
                <div id="bill">
                  <div className="flex justify-center gap-3">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </div>
                    <div className="text-lg font-semibold">
                      Pesanan
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 py-8">
                    {cart.length === 0 && (
                      <div>
                        Belum ada pesanan. Silahkan tambah produk.
                      </div>
                    )}

                    {cart.map((item: CartInterface, index: number) => {
                      return (
                        <div key={index} className="flex flex-row gap-2 items-center">
                          <div className="w-24 h-16 bg-gray-100">

                          </div>
                          <div className="flex-1 text-black text-sm font-semibold">
                            {item.name}
                          </div>
                          <div className="text-black text-sm font-semibold">
                            x {item.quantity}
                          </div>
                          <div className="text-blue-400 text-sm font-semibold">
                            {new Intl.NumberFormat("id-ID", {
                              currency: "IDR",
                              style: "currency",
                              minimumFractionDigits: 0,
                            }).format(item.quantity * item.price)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => clearCart()} className="col-span-2 text-red-500 border-red-500 border-2 bg-white text-center py-1 font-semibold">
                    Clear Cart
                  </button>
                  <button onClick={() => saveBill()} className="text-white bg-green-700 text-center py-1 shadow-sm">
                    Save Bill
                  </button>
                  <button onClick={() => printBill()} className="text-white bg-green-700 text-center py-1 shadow-sm">
                    Print Bill
                  </button>
                  <button onClick={() => setModalCharge(true)} className="col-span-2 text-white bg-blue-400 text-center py-2">
                    Charge &nbsp;
                    {
                      new Intl.NumberFormat("id-ID", {
                        currency: "IDR",
                        style: "currency",
                        minimumFractionDigits: 0,
                      }).format(cart.reduce((sum, item) => sum + (item.quantity * item.price), 0))
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalBill && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-20 bg-gray-900/50 w-screen h-screen flex justify-center items-center">
          <div className="bg-white w-4/6 p-8 flex flex-row gap-4">
            <div className="flex-1 font-semibold text-xl">
              Pesanan Disimpan
            </div>
            <button onClick={() => setModalBill(false)} className="border-gray-200 border-2 py-2 px-4 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {modalOrder && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-20 bg-gray-900/50 w-screen h-screen flex justify-center items-center">
          <div className="bg-white w-4/6 p-8 flex flex-row gap-4">
            <div className="flex-1 font-semibold text-xl">
              Transaksi #{orderNumber} Berhasil Disimpan
            </div>
            <button onClick={() => setModalOrder(false)} className="border-gray-200 border-2 py-2 px-4 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      {modalCharge && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-20 bg-gray-900/50 w-screen h-screen flex justify-center items-center">
          <div className="bg-white w-4/6 p-8 flex flex-col gap-4">
            <div className="font-semibold text-2xl">
              Detail Pesanan
            </div>
            <div className="flex flex-row gap-6">
              <div className="flex-1">
                <table className="w-full">
                  <thead className="bg-gray-200 text-gray-900 text-sm">
                    <tr>
                      <td className="p-2">
                        #
                      </td>
                      <td className="p-2">
                        Nama
                      </td>
                      <td className="p-2 w-28">
                        Foto
                      </td>
                      <td className="p-2">
                        Harga
                      </td>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-100 text-gray-900 text-sm">
                    {cart.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td className="p-2">
                            {index+1}
                          </td>
                          <td className="p-2">
                            {item.name} &nbsp;
                            x {item.quantity}
                          </td>
                          <td className="p-2">
                            <div className="w-24 h-16 bg-gray-200">
                            </div>
                          </td>
                          <td className="p-2">
                            {new Intl.NumberFormat("id-ID", {
                              currency: "IDR",
                              style: "currency",
                              minimumFractionDigits: 0,
                            }).format(item.quantity * item.price)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="w-1 bg-gray-200"></div>

              <div className="w-62 flex flex-col gap-4">
                <div className="text-center">
                  Uang Pembeli (Rp)
                </div>
                <div>
                  <input value={buyerMoney} onChange={(e) => setBuyerMoney(e.target.value)} type="text" className="w-full bg-white p-2 border-gray-200 border-2 text-sm" />
                </div>
                <div className="flex flex-row gap-2">
                  <button onClick={() => setModalCharge(false)} className="flex-1 border-gray-200 border-2 py-1 text-sm">
                    Close
                  </button>
                  <button onClick={() => createOrder()} className="flex-1 bg-blue-400 text-white py-1 text-sm">
                    Pay!
                  </button>
                </div>
                {buyerMoney > 0 && cart.reduce((sum, item) => sum + (item.quantity * item.price), 0) > 0 && (
                  <div className="text-red-500">
                    Kembalian: &nbsp;

                    {new Intl.NumberFormat("id-ID", {
                      currency: "IDR",
                      style: "currency",
                      minimumFractionDigits: 0,
                    }).format(buyerMoney - cart.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                  </div>
                )}                
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
