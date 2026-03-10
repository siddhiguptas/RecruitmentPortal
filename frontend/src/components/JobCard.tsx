import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, DollarSign, Clock, Building, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { Job } from '../types';
import { Button } from './Button';
import { studentService } from '../services/studentService';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      await studentService.applyToJob(job._id);
      // You might want to show a success message or update the UI
      alert('Application submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to apply for job');
    } finally {
      setIsApplying(false);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'object' && salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    return `$${salary.toLocaleString()}`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{job.title}</h3>
            <p className="text-emerald-600 font-medium">{job.company}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getTimeAgo(job.createdAt)}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={toggleBookmark}
          className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <Bookmark className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
          {job.jobType}
        </span>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
          {job.experienceRequired || 'Not specified'}
        </span>
        {job.salary && (
          <div className="flex items-center gap-1 text-slate-600">
            <DollarSign className="w-4 h-4" />
            {formatSalary(job.salary)}
          </div>
        )}
      </div>

      <p className="text-slate-600 text-sm mb-6 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md"
            >
              {skill}
            </span>
          ))}
          {job.skillsRequired && job.skillsRequired.length > 3 && (
            <span className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md">
              +{job.skillsRequired.length - 3} more
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="w-4 h-4" />
            View Details
          </Button>
          <Button
            onClick={handleApply}
            disabled={isApplying}
            size="sm"
            className="gap-1"
          >
            {isApplying ? 'Applying...' : 'Apply Now'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;