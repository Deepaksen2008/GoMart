// import amqplib from "amqplib"


// let connection, channel;
// async function connectToRabbitMQ() {
//     try {
//         const amqpServer = 'amqp://guest:guest@localhost:5672';
//         connection = await amqplib.connect(amqpServer);
//         channel = await connection.createChannel();
//         await channel.assertQueue('customer-service-queue');
//         console.log('Connected to RabbitMQ');
//     } catch (error) {
//         console.error('Error connecting to RabbitMQ:', error);
//     }
// }

// export default connectToRabbitMQ;