axios.defaults.baseURL=SERVER

window.onload=async()=>{
  
  const session = await getsession();
  
    if (!session) {
      // Not logged in → redirect to login
      location.href = "/login";
      return;
    }
  showuserDetails()
   fetchFiles()
   fetchImage()
}

const getToken=()=>{
  const option={
    headers:{
      Authorization:`Bearer ${localStorage.getItem("authToken")}`
    }
  }
  return option
}


const notify = new Notyf({
  position: { x: "right", y: "top" },
});

const showuserDetails = async () => {
  const session = await getsession();
  if (!session) return; // safety

  const fullname = document.getElementById("username");
  const email = document.getElementById("useremail");

  fullname.innerHTML = session.fullname;
  email.innerHTML = session.email;
};




const toggleDrawer=()=>{
    const drawer=document.getElementById('drawer')
    const rightValue=drawer.style.right
    if(rightValue==="0px")
    {
        drawer.style.right="-33.33%"
    }
    else{
         drawer.style.right="0px"
    }
}


const uploadFile = async (e) => {
  e.preventDefault();
  const uploadButton=document.getElementById('upload-btn')

  try {
    const progress=document.getElementById("progress")
    const form = e.target;
    const formData = new FormData(form);
     
    // Validating Form Size
     const file=formData.get('file')
     const size=getsize(file.size)
     if(size>200)
        return notify.error("File Size Too Large MaxSize Is 200Mb Allowed ")

     
    const option = {
      onUploadProgress: (e) => {
        const loaded=e.loaded
        const total=e.total
        const percentageValue =Math.floor((loaded*100)/total)
        progress.style.width=percentageValue+'%'
        progress.innerHTML=percentageValue
      },
      ...getToken()
    };

    uploadButton.disabled=true
    const {data}=await axios.post(`/api/file`, formData, option);
    notify.success(`file has been uploaded !`)
    fetchFiles()
    uploadButton.disabled=false
    progress.style.width=0
    progress.innerHTML=''
    form.reset()
    toggleDrawer()
  } catch (err) {
    notify.error(err.response? err.response.data.message:err.message)
  }
};

const getsize = (size) => {
  if (size < 1024) {
    return `${size} Bytes`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};


const fetchFiles=async(e)=>{
  try{
      const option=getToken()
      const {data}=await axios.get(`/api/file`,option)
      const table=document.getElementById('files-table')
      table.innerHTML=""
      for(let file of data)
      {
        const ui=`
        <tr class="text-gray-500 border-gray-100">
                        <td class="py-4 pl-6 capitalize">${file.filename}</td>
                        <td class="capitalize">${file.type}</td>

                        <td>${getsize(file.size)}</td>
                        <td>${moment(file.createdAt).format('DD MMM YYYY  hh:mm A')}</td>
                        <td>
                            <div class="space-x-3">
                                <button class="bg-rose-400 px-2 py-1 text-white hover:bg-rose-600 rounded" onclick="deleteFile('${file._id}',this)">
                                    <i class="ri-delete-bin-4-line"></i>
                                </button>

                                <button class="bg-green-400 px-2 py-1 text-white hover:bg-green-600 rounded" onclick="downloadFile('${file._id}','${file.filename}',this)">
                                    <i class="ri-download-line"></i>
                                </button>
                                
                                <button class="bg-amber-400 px-2 py-1 text-white hover:bg-amber-600 rounded" onclick="openModalForShare('${file._id}', '${file.filename}')">
                                    <i class="ri-share-line"></i>
                                </button>

                            </div>
                        </td>

        </tr>
        `
      table.innerHTML+=ui
      }
  }
  catch(err)
  {
    notify.error(err.response? err.response.data.message:err.message)
    
  }
}








const deleteFile=async(id)=>{
  try{
    await axios.delete(`/api/file/${id}`,getToken())
    notify.success("File Delated !")
    fetchFiles()
    
  }
  catch(err)
  {
    notify.error(err.response? err.response.data.message:err.message)
  }
}


const downloadFile = async (id, name, button) => {
  try {
    button.innerHTML = '<i class="ri-loader-2-line animate-spin"></i>';
    button.disabled = true;

    // API call
    const response = await axios.get(`/api/file/download/${id}`, {
      ...getToken(),
      responseType: "blob", // force blob response
    });

    // Blob create
    const blob = new Blob([response.data], { type: response.data.type });
    const url = URL.createObjectURL(blob);

    // Anchor element banake auto click
    const a = document.createElement("a");
    a.href = url;
    a.download = name;   // filename as it is (no double extension)
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (err) {
    notify.error(err.response?.data?.message || err.message);
  } finally {
    button.innerHTML = '<i class="ri-download-line"></i>';
    button.disabled = false;
  }
};



const openModalForShare = (id, filename)=>{
  new Swal({
      showConfirmButton: false,
      html: `
          <form class="text-left flex flex-col gap-6" onsubmit="shareFile('${id}', event)">
              <h1 class="font-medium text-black text-2xl">Email id</h1>
              <input type="email" required class="border border-gray-300 w-full p-3 rounded" placeholder="mail@gmail.com" name="email" />
              <button id="send-button" class="bg-indigo-400 hover:bg-indigo-500 text-white rounded py-3 px-8 w-fit font-medium">Send</button>
              <div class="flex items-center gap-2">
                  <p class="text-gray-500">You are sharing - </p>
                  <p class="text-green-400 font-medium">${filename}</p>
              </div>
          </form>
      `
  })
}

const shareFile = async (id, e)=>{
  const sendButton = document.getElementById("send-button")
  const form = e.target

  try {
      e.preventDefault()
      sendButton.disabled = true
      sendButton.innerHTML = `
          <i class="fa fa-spinner fa-spin mr-2"></i>
          Processing
      `
      const email = form.elements.email.value.trim()
      const payload = {
          email: email,
          fileId: id
      }
      await axios.post('/api/share', payload,getToken())
      notify.success("File sent successfully !")
  }
  catch(err)
  {
    notify.error(err.response ? err.response.data.message : err.message)
  }
  finally {
      Swal.close()
  }
}






const uploadImage = () => {
  try {
    const input = document.createElement("input");
    const pic = document.getElementById("pic");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("picture", file);

      const { data } = await axios.post("/api/profile-picture", formData, getToken());

      // Backend se direct Cloudinary URL mil raha hoga
      pic.src = data.image;  

      // Update session/localStorage bhi karna hoga
      let session = await getsession();
      session.image = data.image;
      localStorage.setItem("session", JSON.stringify(session));
    };
  } catch (err) {
    notify.error(err.response ? err.response.data.message : err.message);
  }
};


const fetchImage = async () => {
  try {
    const { data } = await axios.get("/api/profile-picture", getToken());
    const pic = document.getElementById("pic");
    pic.src = data.image;   // 👈 direct Cloudinary ka URL
  } catch (err) {
    notify.error(err.response ? err.response.data.message : err.message);
  }
};