import { IUser } from "./user";

export type ICartItem = {
  id: number,
  name: string,
  price: number,
  quantity: number,
}

export interface ICart {
  items: ICartItem[]
  total: number;
}

export interface IAppContext {
  user?: IUser;
  setUser?: Function;
  addItem: Function;
  removeItem: Function;
  isAuthenticated: boolean;
  cart: ICart
}
