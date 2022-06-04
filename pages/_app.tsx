import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ApolloProvider } from "@apollo/client";
import Layout from '../components/Layout';
import client from '../lib/apollo-client';
import { useEffect, useState } from 'react';
import AppContext from '../context/AppContext';
import Cookies from 'js-cookie';
import { IUser } from '../types/user';
import { ICart, ICartItem } from '../types/app';
import { IDish } from './restaurants/[id]';

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<IUser>();
  const [cart, setCart] = useState<ICart>({ items: [], total: 0 });

  useEffect(() => {
    const token = Cookies.get("token");

    // restore cart from cookie, this could also be tracked in a db
    const cartFromStorage = Cookies.get("cart");

    if (typeof cartFromStorage === "string" && cartFromStorage !== "undefined") {
      JSON.parse(cartFromStorage).forEach((item: ICartItem) => {
        setCart({
          items: JSON.parse(cartFromStorage),
          total: item.price * item.quantity,
        });
      });
    }

    if (token) {
      // authenticate the token on the server and place set user object
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        // if res comes back not valid, token is not valid
        // delete the token and log the user out on client
        if (!res.ok) {
          Cookies.remove("token");
          setUser(undefined);
          return null;
        }
        const user = await res.json();
        setUser(user);
      });
    }
  }, []);

  function addItem(item: ICartItem & IDish) {
    let items = [...cart.items];
    //check for item already in cart
    //if not in cart, add item if item is found increase quanity ++
    const newItem = items.find((i) => i.id === item.id);
    // if item is not new, add to cart, set quantity to 1
    if (!newItem) {
      const itemClone = {...item};
      //set quantity property to 1
      itemClone.quantity = 1;
      items = [...items, itemClone];
      console.log('items', items);
      console.log('total', cart.total, itemClone.price, cart.total + itemClone.price);
      setCart({
        items,
        total: cart.total + itemClone.price,
      });
      Cookies.set("cart", JSON.stringify(items));
    } else {
      items = cart.items.map((item) =>
        item.id === newItem.id
          ? Object.assign({}, item, { quantity: item.quantity + 1 })
          : item
      );
      setCart({
        items,
        total: cart.total + item.price,
      });
      Cookies.set("cart", JSON.stringify(items));
    }
  };
  function removeItem(item: ICartItem) {
    let items = [...cart.items];
    //check for item already in cart
    //if not in cart, add item if item is found increase quanity ++
    const newItem = items.find((i) => i.id === item.id) || { quantity: 0, id: null, };
    if (newItem.quantity > 1) {
      items = cart.items.map((item) =>
        item.id === newItem.id
          ? Object.assign({}, item, { quantity: item.quantity - 1 })
          : item
      );
      setCart({
        items,
        total: cart.total - item.price,
      });
      Cookies.set("cart", JSON.stringify(items))
    } else {
      const items = [...cart.items];
      const index = items.findIndex((i) => i.id === newItem.id);

      items.splice(index, 1);
      setCart({
        items,
        total: cart.total - item.price
      });
      Cookies.set("cart", JSON.stringify(items));
    }
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
          crossOrigin="anonymous"
        />
      </Head>
      
      <AppContext.Provider value={{
        user,
        isAuthenticated: !!user,
        setUser,
        cart,
        addItem,
        removeItem,
      }}>
        <ApolloProvider client={client}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ApolloProvider>
      </AppContext.Provider>
    </>
  )
}

export default MyApp
