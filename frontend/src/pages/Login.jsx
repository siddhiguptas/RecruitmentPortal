import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){

const navigate = useNavigate()

const [form,setForm] = useState({
email:"",
password:"",
role:"student"
})

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const handleSubmit=async(e)=>{
e.preventDefault()

const res=await fetch("http://localhost:5000/api/auth/login",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify(form)
})

const data=await res.json()

if(res.ok){

localStorage.setItem("token",data.token)
localStorage.setItem("user",JSON.stringify(data.user))

if(data.user.role==="student") navigate("/student")
if(data.user.role==="admin") navigate("/admin")
if(data.user.role==="recruiter") navigate("/recruiter")

}else{
alert(data.message)
}

}

return(

<div className="auth-container">

<h2>Login</h2>

<form onSubmit={handleSubmit}>

<select name="role" onChange={handleChange}>
<option value="student">Student</option>
<option value="recruiter">Recruiter</option>
<option value="admin">Admin</option>
</select>

<input name="email" placeholder="Email" onChange={handleChange}/>
<input type="password" name="password" placeholder="Password" onChange={handleChange}/>

<button>Login</button>

</form>

</div>

)

}

export default Login