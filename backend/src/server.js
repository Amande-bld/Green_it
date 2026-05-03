import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import {createServer} from 'node:http';
import db from "./lib/db.js";

import initializeSocket from "./lib/socket.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, "0.0.0.0", async()=>{
    console.log(`server running on port ${PORT}`);
    try {
        await db.query("SELECT 1");
        console.log("connected to mysql");
    } catch (err) {
        console.log("error in database connection: ", err);
    }
});