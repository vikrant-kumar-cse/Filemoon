axios.defaults.baseURL=SERVER
const notify = new Notyf({
  position: { x: "right", y: "top" },
});

const checkSession =async ()=>{
  const session=await getsession()
  if(session)
    location.href="/dashboard";
}

checkSession()

const signup = async (e) => {
  try {
    e.preventDefault();
    const form = e.target;
    const element = form.elements;

    const payload = {
      fullname: element.text.value,
      email: element.email.value,
      phone: element.Phone.value,
      password: element.password.value,
    };

    const response = await axios.post(`/api/signup`, payload);

    console.log(response);

    notify.success(response.data?.message || "Signup successful!");
    form.reset(); 
    setTimeout(() => {
      location.href="/login"
    }, 2000);
  } catch (err) {
    notify.error(err.response?.data?.message || "Something went wrong");
  }
};