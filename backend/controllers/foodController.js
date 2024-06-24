import foodModel from "../models/foodmodel.js";
// import connectToRabbitMQ from "../config/rabbitmq.js";
import amqplib from "amqplib"
import fs from 'fs';

// //add food item
// const addFood = async (req, res) => {

//     let image_filename = `${req.file.filename}`

//     const food = new foodModel({
//         name: req.body.name,
//         discription: req.body.discription,
//         price: req.body.price,
//         category: req.body.category,
//         image: image_filename
//     })
//     try {
//         await food.save();
//         res.json({ success: true, message: "Food Added" })
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Error" })
//     }
// }

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        // console.log(foods);
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

//remove food item
// const removeFood = async (req, res) => {
//     try {
//         const food = await foodModel.findById(req.body.id);
//         console.log(food);
//         fs.unlink(`uploads/${food.image}`, () => { })
//         await foodModel.findByIdAndDelete(req.body.id)
//         res.json({ success: true, message: "Food removed" })
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Error" })
//     }
// }

async function connectToRabbitMQ() {
    const amqpServer = 'amqp://guest:guest@localhost:5672';
    const connection = await amqplib.connect(amqpServer);
    const channel = await connection.createChannel();
    try {
        // const amqpServer = 'amqp://guest:guest@localhost:5672';
        // connection = await amqplib.connect(amqpServer);
        // channel = await connection.createChannel();
        // await channel.assertQueue('customer-service-queue');
        // console.log('Connected to RabbitMQ');

        const queueName = 'store-service-queue';
        const queueRemove = 'store-service-queue-remove-data';
        await channel.assertQueue(queueName, { durable: true });
        console.log('Waiting for messages in the queue...');

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const jsonData = JSON.parse(msg.content.toString());
                const { message, image } = jsonData;
                const imageBuffer = Buffer.from(image, 'base64');
                fs.writeFileSync(`uploads/${message.image}`, imageBuffer);
                console.log('Received message:', message);
                console.log('Image received and saved as received_image.jpg');
                const newOrder = await addFood(message);
                channel.ack(msg);
                console.log('newOrder :', newOrder);
            }
        });

        channel.consume(queueRemove, async (data) => {
            const Id = await JSON.parse(data.content.toString());
            console.log('Received data:', Id);
            await removeFood(Id);
            channel.ack(data);

        })
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

connectToRabbitMQ()
// .then(() => {

//     channel.consume('store-service-queue', async (data) => {
//         try {
//             const products = await JSON.parse(data.content.toString());
//             console.log('Received products:', products);
//             const newOrder = await addFood(products);
//             channel.ack(data);
//             console.log('newOrder :', newOrder);
//             channel.sendToQueue('customer-service-queue', Buffer.from(JSON.stringify(newOrder)));
//         } catch (error) {
//             console.error('Error processing order:', error);
//             channel.nack(data);
//         }
//     });

//     channel.consume('store-service-queue-remove-data', async (data) => {
//         try {
//             const Id = await JSON.parse(data.content.toString());
//             console.log('Received data:', Id);
//             await removeFood(Id);
//             channel.ack(data);
//         } catch (error) {
//             console.error('Error processing order:', error);
//             channel.nack(data);
//         }
//     });
// });

const addFood = async (message) => {
    console.log(message);
    try {
        const food = new foodModel(message)
        await food.save();
        console.log(food);
        return food
    } catch (error) {
        console.log(error);
    }
}


const removeFood = async (Id) => {
    console.log(Id);
    try {
        const food = await foodModel.findById(Id)
        // console.log(food);
        fs.unlink(`uploads/${food.image}`, () => { })
        await foodModel.findByIdAndDelete(Id)
        console.log("Food removed");
        // res.json({ success: true, message: "Food removed" })
    } catch (error) {
        console.log(error);
        // res.json({ success: false, message: "Error" })
    }
}

export { addFood, listFood, removeFood }
