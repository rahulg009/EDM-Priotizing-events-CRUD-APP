module.exports = {
  mongo: {
    uri: 'mongodb://localhost:27017/event-driven-crud'
  },
  rabbitmq: {
    uri: 'amqp://localhost',
    queue: 'crud-events',
    options: {
      durable: true,
      maxPriority: 10
    },
    priority: {
      read: 10,
      update: 5,
      write: 1
    }
  }
};
