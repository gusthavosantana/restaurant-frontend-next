import { useEffect } from "react";
import Router from "next/router";
import Cookie from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { NextComponentType } from "next";
import { IUser } from "../types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

//register a new user
export const registerUser = (username?: string, email?: string, password?: string): Promise<AxiosResponse<{user: IUser}>> => {
  //prevent function from being ran on the server
  if (typeof window === "undefined") {
    return Promise.reject('Error to call registerUser function from server.');
  }
  return new Promise((resolve, reject) => {
    axios
      .post(`${API_URL}/api/auth/local/register`, { username, email, password })
      .then((res) => {
        //set token response from Strapi for server validation
        Cookie.set("token", res.data.jwt);

        //resolve the promise to set loading to false in SignUp form
        resolve(res);
        //redirect back to home page for restaurance selection
        Router.push("/");
      })
      .catch((error) => {
        //reject the promise and pass the error object back to the form
        reject(error);
      });
  });
};

export const login = (identifier: string, password: string): Promise<AxiosResponse<{user: IUser}>> => {
  //prevent function from being ran on the server
  if (typeof window === "undefined") {
    return Promise.reject('Error to call login function from server.');
  }

  return new Promise((resolve, reject) => {
    axios
      .post(`${API_URL}/api/auth/local/`, { identifier, password })
      .then((res) => {
        //set token response from Strapi for server validation
        Cookie.set("token", res.data.jwt);

        //resolve the promise to set loading to false in SignUp form
        resolve(res);
        //redirect back to home page for restaurance selection
        Router.push("/");
      })
      .catch((error) => {
        //reject the promise and pass the error object back to the form
        reject(error);
      });
  });
};

export const logout = () => {
  //remove token and user cookie
  Cookie.remove("token");
  delete window.__user;
  // sync logout between multiple windows
  window.localStorage.setItem("logout", Date.now().toString());
  //redirect to the home page
  Router.push("/");
};

//Higher Order Component to wrap our pages and logout simultaneously logged in tabs
// THIS IS NOT USED in the tutorial, only provided if you wanted to implement
export function withAuthSync(Component: NextComponentType) {
  const Wrapper = (props: any) => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === "logout") {
        Router.push("/login");
      }
    };

    useEffect(() => {
      window.addEventListener("storage", syncLogout);

      return () => {
        window.removeEventListener("storage", syncLogout);
        window.localStorage.removeItem("logout");
      };
    }, []);

    return <Component {...props} />;
  };

  if (Component.getInitialProps) {
    Wrapper.getInitialProps = Component.getInitialProps;
  }

  return Wrapper;
};