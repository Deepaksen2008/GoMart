import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRouter.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
// import connectToRabbitMQ from "./config/rabbitmq.js"
import dotenv from "dotenv";
import 'dotenv/config'

dotenv.config();

//app config
const app = express()
const port = 4000


// middleware
// app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    if (req.originalUrl === '/api/order/webhook') {
      next(); // Do nothing with the body because I need it in a raw state.
    } else {
      express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
    }
  });


//db connection
connectDB()
// connectToRabbitMQ()

//api endpoint
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))   //http://localhost:4000/images/1714898074307pexels-qjpioneer-708777.jpg
app.use ("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)    //  stripe listen --forward-to http://localhost:4000/api/order/webhook  


app.get("/", (req, res) => {
    res.send("API Working")
})

app.listen(port, () => {
    console.log("Server is Running at port", port);
})

