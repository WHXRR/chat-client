import { io } from "socket.io-client";
import { socketURL } from "@/axios/base";
const socket = io(socketURL);

export default socket