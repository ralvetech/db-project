import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import pool from '../db.ts';
import MyUserRoute from './routes/MyUserRoutes.ts';
import StationRoute from "./routes/StationRoute.ts";


const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());


app.get("/test", async (req: Request, res: Response) => {
    res.json({message : "Hello World!" });
});
app.get('/db-test', async (req, res) => {
    try{
        const[rows] = await pool.query('SELECT NOW() AS time');
        res.json("Db connection succesful");
    }catch(err){
        const error = err as Error;
        console.error("Database connection error:", err);   
        res.status(500).json({error : error.message});
        }
    });
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('MySQL connected successfully!')
    connection.release()
  } catch (err) {
    console.error('MySQL connection failed:', err)
  }
}
testConnection();
router.get("/users", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.use("/api/my/user", MyUserRoute)
app.use('/api/stations', StationRoute)

app.use("/api", router);
app.listen(7000, () => {
    console.log("Server is running on port 7000");
});