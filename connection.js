const mongoose=require('mongoose')

module.exports=()=>{

    mongoose.connect('mongodb+srv://satelliteshop:rankorbit123@cluster0.lyxuhdf.mongodb.net/ShopSatellite')
    .then(()=>{console.log("connected to database")})
    .catch((error)=>{console.log("Error connecting to database",error)});

}