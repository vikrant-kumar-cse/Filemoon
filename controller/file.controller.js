const FileModel=require('../model/file.model')
const fs=require('fs')
const path=require('path')
const { cloudinary } = require('../config/cloudinary');

const getType=(type)=>{
    const ext=type.split("/").pop()

    if(ext==="x-msdownload")
        return "application/exe"

    return type
}

const createFile=async(req,res)=>{
    try{
        const {filename}=req.body
        const file=req.file
        const payload={
        path:(file.destination+file.filename),
        filename:filename,
        type:getType(file.mimetype),
        size:file.size,
        user:req.user.id,
        url: req.file.path,         
        public_id: req.file.filename 
     }
     const newfile=await FileModel.create(payload)
     res.status(200).json(newfile)
     
            
    }catch(err)
    {
        res.status(500).json({Message:err.message})
    }
}

const Fetchfile=async(req,res)=>{
  try{
    const{limit}=req.query
    const file= await FileModel.find({user:req.user.id}).sort({createdAt:-1}).limit(limit)
    res.status(200).json(file)
  }
  catch(err)
  {
       res.status(500).json({Message:"err.message"})
  }
}

const deleteFile = async (req, res) => {
    try {
      const { id } = req.params
      const file = await FileModel.findByIdAndDelete(id)
  
      if (!file) {
        return res.status(404).json({ message: 'File not found' })
      }
  
      // Delete from Cloudinary using public_id
      if (file.public_id) {
        await cloudinary.uploader.destroy(file.public_id)
      }
  
      // If you were storing local files earlier, remove them too (optional)
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
  
      res.status(200).json({ message: "File deleted successfully", file })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  const downloadFile = async (req, res) => {
    try {
      const { id } = req.params;
      const file = await FileModel.findById(id);
  
      if (!file) return res.status(404).json({ message: "File not found!" });
  
      const extn = file.type.split("/").pop();
      const filePath = file.path;
  
      res.setHeader("Content-Disposition", `attachment; filename="${file.filename}.${extn}"`);
      res.sendFile(filePath, (err) => {
        if (err) throw new Error("Failed to download the file");
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

module.exports={
    createFile,
    Fetchfile,
    deleteFile,
    downloadFile
}