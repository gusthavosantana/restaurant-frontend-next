export interface IMessages {
  messages: {
    id: number;
    message: string;
  }[]
}
export interface IError {
  message: IMessages[];
}