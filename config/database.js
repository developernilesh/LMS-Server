const mongoose = require("mongoose");
require("dotnev").config();

exports.dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("DB connection successful"))
    .catch((error)=>{
        console.log("Issue in DB connection",error)
        process.exit(1);
    })
}