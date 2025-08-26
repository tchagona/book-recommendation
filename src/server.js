import express from 'express';
import "dotenv/config";
import cors from "cors";

import {connectDatabase} from "./lib/database.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import job from "./lib/cron.js";

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;

job.start()
app.use(express.json());
app.use(cors());

app.use('/api/auth',authRoutes)
app.use('/api/books',bookRoutes)



app.listen(SERVER_PORT,()=>{
    connectDatabase();
    console.log('Server started on port ' + SERVER_PORT);
})