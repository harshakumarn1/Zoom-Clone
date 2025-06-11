import express from "express"
import mongoose from "mongoose";
import { createServer } from 'node:http'
import { Server } from "socket.io";
import cors from "cors"
import userRoutes from './routes/userroutes.js'
import connectToSocket from "./controllers/socketManager.js";

const app = express();

async function main(){
  const connectionDB = await mongoose.connect("mongodb+srv://harshakumarn566:Agni28102002@cluster0.4dhyf6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  return connectionDB;
}
main().then((connectionDB) => {
    console.log(`database host:${connectionDB.connection.host}`)
})

const server = createServer(app);
const io = connectToSocket(server);

server.listen(3000, () => {
    console.log("server started")
})

app.use( cors() );
app.use( express.json({limit:"40kb"}) )
app.use(express.urlencoded({ limit:"40kb", extended:true }))

app.use('/', userRoutes)

app.get("/", (req, res) => {
    res.send("hello world");
})





