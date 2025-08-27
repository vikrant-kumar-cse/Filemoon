const{Schema,model, default: mongoose}=require('mongoose')

const fileSchema=new Schema({
   user:{
      type:mongoose.Types.ObjectId,
      ref:'User',
      required:true
   },
   
   filename:{
    type:String,
    required:true,
    trim:true,
    tolowercase:true
   },

   path:{
      type:String,
      required:true,
      trim:true,
      tolowercase:true
     },

   type:{
    type:String,
    required:true,
    trim:true
   },

   size:{
    type:Number,
    required:true,
   }
   ,
   url: {
      type: String,
      required: true
    },
    
    public_id: {
      type: String,
      required: true
    }

},{timestamps:true})

const FileModel=model("File",fileSchema)

module.exports= FileModel