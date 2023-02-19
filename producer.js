const amqp = require('amqplib');
const config = require('./config');

let channel;

async function getChannel() {
  if (channel) {
    return channel;
  }
  const connection = await amqp.connect(config.rabbitmq.uri);
  channel = await connection.createChannel();
  await channel.assertQueue(config.rabbitmq.queue, config.rabbitmq.options);
  return channel;
}

async function publishEvent(event, priority) {
  const channel = await getChannel();
  const message = Buffer.from(JSON.stringify(event));
  channel.sendToQueue(config.rabbitmq.queue, message, { priority });
}

module.exports = {
  publishEvent
};
