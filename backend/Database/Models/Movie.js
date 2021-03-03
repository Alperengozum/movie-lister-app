const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const MovieSchema = new Schema({
  id: {type: Number, required: true},
  movieName: {type: String, required: true},
  rate: {type: Number, required: false},
  releaseYear: {type: Number, required:true},
  type: {type:String,required:true},
  details: {type:String,required:false}
})

module.exports=mongoose.model("Movie",MovieSchema);