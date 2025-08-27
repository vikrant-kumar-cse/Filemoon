axios.defaults.baseURL=SERVER
window.onload=async()=>{

  const session = await getsession();
  
    if (!session) {
      // Not logged in → redirect to login
      location.href = "/login";
      return;
    }

 showuserDetails()
 fetchHistory()
 fetchImage()
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



const getToken=()=>{
    const option={
      headers:{
        Authorization:`Bearer ${localStorage.getItem("authToken")}`
      }
    }
    return option
  }


const logout=()=>{
    localStorage.clear()
    location.href="/login"
}


const fetchHistory=async()=>{
    try{
        const {data}=await axios.get("/api/share",getToken())
        const table=document.getElementById("table")
        const notFoundUi=`
        <div class="p-16 text-center">
          <h1 class="text-gray-500">Oops ! You Have Not Shared Any File Yet</h1>
        </div>
        `
        if(data.length===0)
        {
          table.innerHTML=notFoundUi
          return
        }
        for(let item of data)
        {
          const ui=`
          <tr class="text-gray-500 border-gray-100">
                        <td class="py-4 pl-6 capitalize">${item.file.filename}</td>
                        <td>${item.receiverEmail}</td>
                        <td>${moment(item.createdAt).format('DD MMM YY,hh:mm A')}</td>

          </tr>
          `
          table.innerHTML += ui
          

        }
    }
    catch(err)
    {
        notify.error(err.response? err.response.data.message:err.message)
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