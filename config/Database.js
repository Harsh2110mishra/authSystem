const mongoose = require('mongoose');

const { MONGODB_URL } = process.env

exports.connect = () => {
     mongoose
         .connect(MONGODB_URL, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       })
       .then(console.log("DB CONNECTION ESTABILISED SUCCESSFULLY"))
       .catch((err) => {
         console.log("DB CONNECTION FAILED, ERROR:", err);
         process.exit(1);
       });
}