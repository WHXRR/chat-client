import { io } from "socket.io-client";

const socket = io("ws://192.168.1.7:5432");

export default socket