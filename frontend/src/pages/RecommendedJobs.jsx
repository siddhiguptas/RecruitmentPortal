import JobCard from "../components/JobCard";

function RecommendedJobs() {

const jobs = [
{title:"Software Engineer",company:"Google",location:"Bangalore"},
{title:"Backend Developer",company:"Amazon",location:"Hyderabad"},
{title:"Frontend Developer",company:"Microsoft",location:"Noida"}
]

return (
<div>

<h2>Recommended Jobs</h2>

<div style={{display:"flex",gap:"20px"}}>

{jobs.map((job,index)=>(
<JobCard key={index} {...job}/>
))}

</div>

</div>
)
}

export default RecommendedJobs;