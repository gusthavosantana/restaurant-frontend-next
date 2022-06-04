import React from "react";
import { IAppContext } from "../types/app";

const AppContext = React.createContext<IAppContext>({
  isAuthenticated: false,
  cart: { items: [], total: 0 },
  addItem: () => {},
  removeItem: () => {},
});
export default AppContext;