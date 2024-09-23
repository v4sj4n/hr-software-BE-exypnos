import { UserI } from "src/user/user.interface";
import { RoomI } from "../room/room.interface";


export interface JoinedRoomI {
  id?: number;
  socketId: string;
  user: UserI;
  room: RoomI;
}