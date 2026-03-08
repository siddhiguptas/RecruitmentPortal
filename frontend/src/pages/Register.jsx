import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register(){

const navigate=useNavigate()

const [form,setForm]=useState({
name:"",
email:"",
password:"",
role:"student",
branch:"",
adminCode:""
})

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const handleSubmit=async(e)=>{
e.preventDefault()

const res=await fetch("http://localhost:5000/api/auth/register",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify(form)
})

const data=await res.json()

if(res.ok){
alert("Registered Successfully")
navigate("/login")
}else{
alert(data.message)
}

}

return(

<div className="auth-container">

<h2>Register</h2>

<form onSubmit={handleSubmit}>

<input name="name" placeholder="Name" onChange={handleChange}/>
<input name="email" placeholder="Email" onChange={handleChange}/>
<input type="password" name="password" placeholder="Password" onChange={handleChange}/>

<select name="role" onChange={handleChange}>
<option value="student">Student</option>
<option value="recruiter">Recruiter</option>
<option value="admin">Admin</option>
</select>

<input name="branch" placeholder="Branch" onChange={handleChange}/>

{form.role==="admin" && (
<input name="adminCode" placeholder="Admin Code" onChange={handleChange}/>
)}

<button>Register</button>

</form>

</div>

)

}

export default Register