import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)


app.use((err, req, res, next) => {
    const statusCode = res.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message

    })
})

mongoose.connect(
    process.env.MONGODB_URL
).then(() => {
    console.log("MongoDb is Connected!!!");
}).catch((err) => {
    console.log(err);
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}!`);
});
