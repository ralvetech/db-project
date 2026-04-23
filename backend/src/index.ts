import express from "express";
import cors from "cors";
import "dotenv/config";
import MyUserRoute from './routes/MyUserRoutes.js';
import StationRoute from "./routes/StationRoute.js";
import AdminRoute from "./routes/AdminRoute.js";
import SearchHistoryRoute from "./routes/SearchHistoryRoute.js";
import adminReportRouter from "./routes/AdminReportsRoute.ts"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/my/user", MyUserRoute)
app.use('/api/stations', StationRoute)
app.use('/api/admin', AdminRoute)
app.use('/api/search-history', SearchHistoryRoute)
app.use('/api/admin/reports', adminReportRouter) 

app.listen(7000, () => {
  console.log("Server is running on port 7000")
})