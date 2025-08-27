axios.defaults.baseURL = SERVER;

const notify = new Notyf({
  position: { x: "right", y: "top" },
});

const checkSession = async ()=>{
  const session = await getsession()
  
  if(session)
      location.href = "/dashboard"
}

checkSession()

const login = async (e) => {
  try {
    e.preventDefault();
    const form = e.target;
    const element = form.elements;
    const payload = {
      email: element.email.value,
      password: element.password.value,
    };

    const { data } = await axios.post(`/api/login`, payload);

    notify.success(data.message || "Login successful!");
    localStorage.setItem("authToken", data.token);

    setTimeout(() => {
      location.href = "/dashboard";
    }, 2000);
  } catch (err) {
    notify.error(err.response?.data?.message || "Something went wrong");
  }
};
