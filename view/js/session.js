axios.defaults.baseURL=SERVER

const getsession=async()=>{
    try{
        const session=localStorage.getItem("authToken")

    if(!session)
        return null
         
    const payload={
        token:session
    }
    const {data}=await axios.post(`/api/token/verify`,payload)
    return data

    }
    catch (err) {
        return null
      }
}

getsession()

