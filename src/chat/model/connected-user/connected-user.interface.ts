import { UserI } from "src/user/user.interface";


export interface ConnectedUserI {
  id?: number;
  socketId: string;
  user: UserI;
}