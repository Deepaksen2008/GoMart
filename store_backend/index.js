const express = require("express");
const multer = require("multer");
const amqplib = require("amqplib");
const fs = require("fs");

let mongoose = require('mongoose');

let dbURL = "mongodb://localhost:27017/Cluster"
const cors = require("cors")
const app = express();
const port = 8080;

app.use(express.json())
app.use(cors())
app.use("/images", express.static('uploads'))   //http://localhost:8080/images/1714898074307pexels-qjpioneer-708777.jpg

let Schema = mongoose.Schema
const foodSchema = new mongoose.Schema({
    name: { type: String, require: true },
    discription: { type: String, required: true },
    price: { type: Number, require: true },
    image: { type: String, require: true },
    category: { type: String, require: true }
})

const foodModel = mongoose.models.foods || mongoose.model('foodModel', foodSchema, 'foods')

mongoose.connect(dbURL)
    .then(() => {
        console.log("Mongodb database Connected...");
    }).catch((err) => {
        console.log(err);
    })

const amqpServer = 'amqp://guest:guest@localhost:5672';
let connection, channel;
async function connectToRabbitMQ() {
    try {
        connection = await amqplib.connect(amqpServer);
        channel = await connection.createChannel();

        // await channel.assertQueue('store-service-queue');
        // await channel.assertQueue('store-service-queue-remove-data')
        // console.log('Connected to RabbitMQ');

        channel.consume('customer-service-queue', async (data) => {
            const order = await JSON.parse(data.content.toString());
            console.log('Consumed from store service queue', order);
            channel.ack(data);
        });

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}
connectToRabbitMQ();


app.get('/get', (req, res) => {
    foodModel.findOne({})
        .then(() => {
            res.send("API Running...")
        }).catch((err) => {
            console.log(err);
        })
})

const storage = multer.diskStorage({

    destination: "uploads",
    filename: (req, file, cd) => {
        return cd(null, `${Date.now()}${file.originalname}`)
    }
})
const upload = multer({ storage: storage })


app.post("/add", upload.single("image"), async (req, res) => {

    let image_filename = `${req.file.filename}`

    const food = new foodModel({
        name: req.body.name,
        discription: req.body.discription,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    })
    try {
        await food.save();

        const imageBuffer = fs.readFileSync(`uploads/${food.image}`);
        const imageBase64 = imageBuffer.toString('base64');
        const data = {
            message: food,
            image: imageBase64
        };

        const jsonData = JSON.stringify(data);

        const queueName = 'store-service-queue';
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(jsonData));
        console.log("Message sent to the queue");

        console.log('Product created successfully', food);
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
})

app.get("/list", async (req, res) => {
    try {
        const foods = await foodModel.find({})
        // console.log(foods);
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

})

app.post("/remove", async (req, res) => {
    try {
        console.log(req.body.id);
        channel.sendToQueue(
            'store-service-queue-remove-data',
            Buffer.from(JSON.stringify(req.body.id))
        );
        const food = await foodModel.findById(req.body.id);
        console.log('ProductId sended successfully', food);
        fs.unlink(`uploads/${food.image}`, () => { })
        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
})


app.listen(port, () => {
    console.log("Server is Running at port", port);
}) 