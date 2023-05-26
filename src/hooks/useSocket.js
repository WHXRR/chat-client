import { io } from "socket.io-client";

function useSocket() {
  const socket = io("ws://192.168.1.7:5432");
  return socket
}

export default useSocket