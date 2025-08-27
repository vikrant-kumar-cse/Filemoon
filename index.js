const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose')
mongoose.connect(process.env.DB)
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Error:", err));

const express = require('express')
const root = process.cwd()
const app = express()
const path = require('path')

const { v4: uniqueId } = require('uuid')

const multer = require('multer')

// const storage = multer.diskStorage({
//   destination: (req, file, next) => {
//     next(null, 'uploads/')
//   },
//   filename: (req, file, next) => {
//     const nameArr = file.originalname.split(".")
//     const ext = nameArr.pop()
//     const name = `${uniqueId()}.${ext}`
//     next(null, name)
//   }
// })

// const upload = multer({ 
//   storage: storage,
//   limits:{
//     fileSize:200*1000*1000
//   }

// })

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static("view"))


const { Signup, login, updateImage ,fetchImage} = require('./controller/user.controller')
const { createFile, Fetchfile, deleteFile, downloadFile } = require('./controller/file.controller')
const { fetchDashboard } = require('./controller/dashboard.controller')
const { verifytoken } = require('./controller/token.controller')
const {shareFile,fetchShared}=require('./controller/share.controller')
const AuthMiddleware = require('./middleware/auth.middleware')
const {uploadFile, uploadImage}=require('./config/cloudinary')

const getpath = (filename) => {
  return path.join(root, "view", filename)
}

// UI Endpoints
app.get('/signup', (req, res) => res.sendFile(getpath("signup.html")))
app.get('/login', (req, res) => res.sendFile(getpath("index.html")))
app.get('/dashboard', (req, res) => res.sendFile(getpath("app/dashboard.html")))
app.get('/history', (req, res) => res.sendFile(getpath("app/history.html")))
app.get('/files', (req, res) => res.sendFile(getpath("app/my-files.html")))



// API Endpoints
app.post('/api/signup', Signup)
app.post('/api/login', login)
app.post('/api/profile-picture',AuthMiddleware,uploadImage.single('picture'), updateImage)
app.get('/api/profile-picture',AuthMiddleware,fetchImage)
app.post('/api/file',AuthMiddleware, uploadFile.single('file'), createFile)
app.get('/api/file',AuthMiddleware, Fetchfile)
app.delete('/api/file/:id',AuthMiddleware, deleteFile)
app.get('/api/file/download/:id', downloadFile)
app.get('/api/dashboard',AuthMiddleware, fetchDashboard)
app.post('/api/token/verify', verifytoken)
app.post('/api/share',AuthMiddleware,shareFile)
app.get('/api/share',AuthMiddleware,fetchShared)
// Start server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
