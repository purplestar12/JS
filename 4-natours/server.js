const mongoose = require('mongoose');
const dotenv = require('dotenv');

//loads .env file contents to process.env
dotenv.config({ path: './config.env' });

const app = require('./app');

const PORT = process.env.PORT;

const db = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

//returns promise
mongoose
  .connect(db)
  .then(() => console.log('DB connection is successful!!'));

// START SERVER
app.listen(PORT, () => {
  console.log(`The server is listening at port ${PORT}`);
});
