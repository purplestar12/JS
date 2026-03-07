const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Error 🔴! App shutting down');
  console.log(err.name, err.message);
  process.exit(1);
});

//loads .env file contents to process.env
dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT;
const LOCALHOST = process.env.LOCALHOST;

const db = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

//returns promise
mongoose.connect(db).then(() => console.log('DB connection is successful!!'));

// START SERVER
app.listen(PORT, LOCALHOST, () => {
  console.log(`The server is listening at port ${PORT}`);
});
