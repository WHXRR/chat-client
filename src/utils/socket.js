import { io } from "socket.io-client";

const socket = io("ws://192.168.1.7:5432");
const socketConnectPromise = new Promise((resolve) => {
  socket.on("connect", () => {
    resolve(socket)
  });
})

const socketMessagePromise = new Promise((resolve) => {
  socket.on("message", (data) => {
    resolve(data)
    console.log(data);
  });
})

export default socket

export {
  socketConnectPromise,
  socketMessagePromise
}