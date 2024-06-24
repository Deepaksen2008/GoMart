import orderModel from "../models/ordermodel.js";
import userModel from "../models/useModel.js"
import amqplib from "amqplib"
import fs from "fs"
import { Buffer } from "buffer";
import Stripe from "stripe"
import dotenv from "dotenv";
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


//placing user order for frontend
const placeOrder = async (req, res) => {

    const frontend_url = "http://localhost:5173"   //http://localhost:5173 

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        await newOrder.save();
        console.log(newOrder._id);
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })


        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 * 80
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 * 80
            },
            quantity: 1
        })

        const customer = await stripe.customers.create({
            metadata: {
                userId: req.body._id
            }
        })


        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            customer: customer.id,
            metadata: {
                userId: `${newOrder._id}`
            },
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })
        // console.log(session);
        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error' })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

//user orders for frontend
const userOrders = async (req, res) => {
    try {
      const orders = await orderModel.find({
            userId: req.body.userId
        })
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

const listOrder = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

const amqpServer = 'amqp://guest:guest@localhost:5672';
let connection, channel;
async function connectToRabbitMQ() {
    try {
        connection = await amqplib.connect(amqpServer);
        channel = await connection.createChannel();

        // await channel.assertQueue('store-service-queue');
        // await channel.assertQueue('store-service-queue-remove-data')
        // console.log('Connected to RabbitMQ');

        // channel.consume('customer-service-queue', async (data) => {
        //     const order = await JSON.parse(data.content.toString());
        //     console.log('Consumed from store service queue', order);
        //     channel.ack(data);
        // });

    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}
connectToRabbitMQ();


// This is your Stripe CLI webhook secret for testing your endpoint locally.

const stripeCheckout = async (req, res) => {
    const endpointSecret = "whsec_ffe939ae0e3ac25ec8e1e71c4fb1e113e60d437c24bc9d9af1226a20ff321a8d";
    const sig = req.headers['stripe-signature'];

    // If endpointSecret is provided, verify the webhook signature
    if (endpointSecret) {
        let event;

        // let rawBody = JSON.stringify(req.body);

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            // console.log("webhooks verified");
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // console.log(event.type);
        // console.log(event.data.object);

        //payment_intent.requires_action
        //payment_intent.created
        //charge.succeeded
        //payment_intent.succeeded
        //checkout.session.completed
        //charge.updated

        // Extract event data and type

        switch (event.type) {
            case 'customer.created':
                const customer_created = event.data.object;
                // console.log(customer_created.id);
                // console.log(customer_created.metadata.userId);  //id //metadata.userId
                // let orderId = customer_created.metadata.userId;
                break;
            case 'customer.updated':
                const customer_updated = event.data.object;
                break;
            case 'payment_intent.requires_action':
                const payment_intent = event.data.object;
                // console.log(payment_intent);          
                break;
            // ... handle other event types
            case 'payment_intent.created':
                const payment_intent_created = event.data.object;
                // console.log(payment_intent_created.amount);
                // console.log(payment_intent_created.payment_method_options);// amount, payment_method_options,
                break;
            // ... handle other event types
            case 'charge.succeeded':
                const charge_succeeded = event.data.object;
                // console.log(charge_succeeded.status);
                // console.log(charge_succeeded.id); // status // billing_details //id
                // console.log(charge_succeeded.billing_details);
                break;
            // ... handle other event types
            case 'payment_intent.succeeded':
                const payment_intent_succeeded = event.data.object;
                // console.log(payment_intent_succeeded);

                break;
            // ... handle other event types
            // if(event.type === 'checkout.session.completed'){
            //     stripe.customers.retrieve(data.customer)
            //     .then((customer)=>{
            //         console.log(customer);
            //         console.log("data", data);
            //     })
            // }

            case 'checkout.session.completed':
                // stripe.customers.retrieve(data.customer)
                // .then((customer) => {
                //     console.log(customer);
                //     console.log("data", data);
                // })
                // .catch((error) => {
                //     console.error("Error retrieving customer:", error);
                // });

                const checkout_session_completed = event.data.object;
                // console.log(checkout_session_completed);
                // console.log(checkout_session_completed.amount_total);
                // console.log(checkout_session_completed.customer_details.name); //payment_status // status //
                // console.log(checkout_session_completed.customer_details.email);
                // console.log(checkout_session_completed.id);
                // console.log(checkout_session_completed.mode);
                // console.log(checkout_session_completed.status);

                try {
                    // const newOrder = new orderModel
                    const orderDetail = {
                        id: checkout_session_completed.id,
                        amount_total: checkout_session_completed.amount_total,
                        name: checkout_session_completed.customer_details.name,
                        email: checkout_session_completed.customer_details.email,
                        payment_mode: checkout_session_completed.mode,
                        status: checkout_session_completed.status
                    };
                    console.log(orderDetail);

                    // Update the userModel to add orderDetail to an array field, let's call it orders
                    // console.log(JSON.parse(((req.body).toString('utf-8'))));
                    // console.log(orderId);
                    const orderDetails = await orderModel.findByIdAndUpdate(
                        event.data.object.metadata.userId,
                        { $push: { order: orderDetail } },
                        { new: true }
                    );
                    await orderDetails.save();

                    const dpOrder = {
                        id : orderDetails.userId,
                        userId : orderDetails.userId,
                        status : orderDetails.status,
                        date : orderDetails.date,
                        name : orderDetails.address.firstName,
                        lname : orderDetails.address.lastName,
                        email : orderDetails.address.email,
                        address : orderDetails.address.street,
                        city : orderDetails.address.city,
                        phone : orderDetails.address.phone,
                        zipcode: orderDetails.address.zipcode,
                        orderId : orderDetails.order[0].id,
                        orderName : orderDetails.order[0].name,
                        amount : orderDetails.order[0].amount_total,
                        payment : orderDetails.order[0].status
                    }
                    console.log(dpOrder);
                    const jsonData = JSON.stringify(dpOrder);
                    const queueName = 'dp-service-queue';

                    channel.sendToQueue(queueName, Buffer.from(jsonData));
                    console.log("Message sent to the queue");


                    console.log('orderDetail :-' + orderDetails);
                    res.json({ success: true, message: "Order placed successfully" });
                } catch (error) {
                    console.log(error);
                    res.status(500).json({ success: false, message: "Error placing order" });
                }
                break;
            // ... handle other event types
            case 'charge.updated':
                const charge_updated = event.data.object;
                // console.log(charge_updated.id); //id
                break;
            // ... handle other event types
            case 'payment_intent.succeeded':

            // console.log(payment_intent.customer.created);
            // console.log(payment_intent.customer.updated);
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

    } else {
        console.log("Warning: Endpoint secret not provided. Signature verification skipped.");
        res.status(400).send("Endpoint secret not provided. Signature verification skipped.");
    }

};


const orderDetails = async (req, res) => {
    try {
        const orders = await orderModel.find({
            userId: req.body.userId
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};




export { placeOrder, verifyOrder, userOrders, listOrder, updateStatus, stripeCheckout, orderDetails };
