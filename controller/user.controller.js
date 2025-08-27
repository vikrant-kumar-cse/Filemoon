const Usermodel=require('../model/user.model')
const bcrypt=require('bcrypt')
const jwt = require("jsonwebtoken")
const path=require('path')


const Signup=async(req,res)=>{
    try
    {
            await Usermodel.create(req.body)
            res.status(200).json({Message:"Signup Succes,Please Login"})
    }
    catch(err)
    {
        res.status(200).json({message:err.message})
    }
}

const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Usermodel.findOne({ email: email });
  
      if (!user) {
        return res.status(404).json({ message: "User Does Not Exist" });
      }
  
      const isLogin = bcrypt.compareSync(password, user.password);
  
      if (!isLogin) {
        return res.status(401).json({ message: "Incorrect Password" });
      }
     
      const payload={
        fullname:user.fullname,
        email:user.email,
        phone:user.phone,
        id:user._id,
        image: user.image || null
      }
      const token = jwt.sign(payload , process.env.JWT_SECRET,{expiresIn:'7d'})
      return res.status(200).json({ message: "Login Success!",token:token });
  
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  
  const updateImage = async (req, res) => {
    try {
      const user = await Usermodel.findByIdAndUpdate(
        req.user.id,
        { 
          image: req.file.path,              // 👈 yeh Cloudinary ka URL hota hai
          image_public_id: req.file.filename // 👈 public id bhi save kar lo (delete/update ke liye kaam aayega)
        },
        { new: true }
      );
  
      if (!user) {
        return res.status(401).json({ message: "Invalid request" });
      }
  
      res.status(200).json({ image: user.image });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  


  const fetchImage = async (req, res) => {
    try {
      const { image } = await Usermodel.findById(req.user.id);
  
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
  
      res.status(200).json({ image });  // 👈 direct URL bhejo
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  
module.exports={
    Signup,
    login,
    updateImage,
    fetchImage
}