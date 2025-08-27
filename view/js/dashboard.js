axios.defaults.baseURL=SERVER

const logout=()=>{
    localStorage.clear()
    location.href="/login"
}

const notify = new Notyf({
    position: { x: "right", y: "top" },
  });


 const getToken=()=>{
    const option={
      headers:{
        Authorization:`Bearer ${localStorage.getItem("authToken")}`
      }
    }
    return option
  }


  window.onload = async () => {
    const session = await getsession();
  
    if (!session) {
      // Not logged in → redirect to login
      location.href = "/login";
      return;
    }
  
    // Logged in → safe to load dashboard data
    fetchImage();
    showuserDetails();
    fetchFileRecord();
    fetchRecentFiles();
    fetchRecentShare();
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
  
  const showuserDetails = async () => {
    const session = await getsession();
    if (!session) return; // safety
  
    const fullname = document.getElementById("username");
    const email = document.getElementById("useremail");
  
    fullname.innerHTML = session.fullname;
    email.innerHTML = session.email;
  };
  


const fetchRecentFiles=async()=>{
    try{
          const {data}= await axios.get("/api/file?limit=3",getToken())
          const table= document.getElementById("recent-files-box")
          for(let item of data)
          {
            const ui=`
            <div class="flex justify-between items-start">
                                <h1 class="capiatalize">${item.filename}</h1>
                                <small class="text-sm text-gray-600">${moment(item.createdAt).format('DD MMM YYYY, hh:mm A')}</small>
                            </div>
                            <p class="text-sm text-gray-600">${getsize(item.size)}</p>

            `
            table.innerHTML +=ui
          }
    }
    catch(err)
    {
        notify.error(err.response ? err.response.data.message:err.message)
    }
}



const fetchRecentShare=async()=>{
    try{
          const {data}= await axios.get("/api/share?limit=3",getToken())
          const table= document.getElementById("recent-shared-box")
          for(let item of data)
          {
            const ui=`
            <div class="flex justify-between items-start">
                                <h1 class="capiatalize">${item.file.filename}</h1>
                                <small class="text-sm text-gray-600">${moment(item.createdAt).format('DD MMM YYYY, hh:mm A')}</small>
                            </div>
                            <p class="text-sm text-gray-600">${item.receiverEmail}</p>

            `      
            table.innerHTML +=ui
          }
    }
    catch(err)
    {
        notify.error(err.response ? err.response.data.message:err.message)
    }
}

const fetchFileRecord=async()=>{

  try
  {
     const {data}=await axios.get("/api/dashboard",getToken())
     const reportCard =document.getElementById("report-card")
     for(let item of data)
     {
        const ui=`
        <div class="overflow-hidden relative bg-white rounded-lg shadow hover:shadow-lg h-40 flex items-center justify-center flex-col">
                        <h1 class="text-xl font-semibold text-gray-600 capitalize">${item._id.split("/")[0]}</h1>
                        <p class="text-4xl font-bold">${item.total}</p>
                        <div class="flex justify-center items-center w-[100px] h-[100px] rounded-full absolute top-7 -left-4"
                        style="background-image: linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%);"
                        >
                        <i class="ri-live-line text-4xl text-white"></i>
                    </div>
                    </div>
        
        `
        reportCard.innerHTML += ui

     }





  }catch(err)
  {
    notify.error(err.response ? err.response.data.message:err.message)
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
