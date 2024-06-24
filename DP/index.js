import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import connections from "./db.js"
import amqplib from "amqplib"


const app = express();
const port = 5050;
app.use(cors())

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

const amqpServer = 'amqp://guest:guest@localhost:5672';
async function connectToRabbitMQ() {
    const connection = await amqplib.connect(amqpServer);
    const channel = await connection.createChannel();
    try {
        
        channel.consume('dp-service-queue', async (data) => {
            const order = await JSON.parse(data.content.toString());
            console.log('Consumed from store service queue', order);
            channel.ack(data);
            let value = {
                oid: order.id,
                userId: order.userId,
                name: order.name,
                amount: order.amount,
                address: order.address,
                city: order.city,
                status: order.status,
                date: order.date,
                payment: order.payment,
                lname: order.lname,
                email: order.email,
                phone: order.phone,
                orderId: order.orderId,
                orderName: order.orderName,
                pincode : order.zipcode
            };
            console.log(value);
                let sqlQuery = 'INSERT INTO orderdetails set ?';

                connections.query(sqlQuery, [value], (error, result) => {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log(result);
                    }
                });


            });

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}
connectToRabbitMQ();




app.get('/get', (req, res) => {
    let sqlQuery = 'SELECT * FROM cxdetails';
    connections.query(sqlQuery, (error, result) => {
        if (error) {
            console.log(error.message);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})
