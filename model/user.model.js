const {Schema,model}=require('mongoose')
const bcrypt =require('bcrypt')

userSchema=new Schema({
    image:{
        type:String
    },

    fullname:{
         type:String,
         required:true,
         trim:true,
         tolowercase:true
    },
    email:{
         type:String,
         required:true,
         trim:true,
         match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please Enter Correct formate of  Email Id'
         ]
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        match:[
          /^[6-9]\d{9}$/,
          'Please Enter Correct format of Phone'
        ]
     },
    password:{
        type:String,
        required:true,
        trim:true
    },
    image_public_id: 
    { type: String },

},{timestamps:true})


userSchema.pre('save',async function(next){
    const count= await model("User").countDocuments({phone: this.phone})
    if(count>0)
        throw next(new Error("Mobile Number Already Exist"))

    next()
})

userSchema.pre('save',async function(next){
    const count=await model("User").countDocuments({email:this.email})
    if(count>0)
        throw next(new Error("Email Is Already Exist"))
    next()
})

userSchema.pre('save',async function(next){
        const encryptpassword= await bcrypt.hash(this.password.toString(),12)
        this.password=encryptpassword
        next()
})



const UserModel=model("User",userSchema)

module.exports=UserModel