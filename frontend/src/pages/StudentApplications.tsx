import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { studentService } from '../services/studentService';
import { Application } from '../types';
import { Button } from '../components/Button';
import { cn, formatDate } from '../utils';

const StudentApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getMyApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="text-blue-600 w-5 h-5" />;
      case 'shortlisted':
        return <AlertCircle className="text-amber-600 w-5 h-5" />;
      case 'interviewing':
        return <CheckCircle2 className="text-purple-600 w-5 h-5" />;
      case 'offered':
        return <CheckCircle2 className="text-emerald-600 w-5 h-5" />;
      case 'rejected':
        return <XCircle className="text-rose-600 w-5 h-5" />;
      default:
        return <Clock className="text-slate-600 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'shortlisted':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'interviewing':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'offered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-slate-500 mt-1">Track the status of your job applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchApplications} variant="outline" className="gap-2">
            <Clock size={18} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application, index) => (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(application.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {typeof application.job === 'string' ? 'Job Application' : application.job.title}
                    </h3>
                    <p className="text-slate-500 font-medium">
                      {typeof application.job === 'string' ? '' : application.job.company}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                        getStatusColor(application.status)
                      )}>
                        {application.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Applied on {formatDate(application.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Pipeline */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Application Progress</h4>
                <div className="flex items-center gap-2">
                  {['applied', 'shortlisted', 'interviewing', 'offered'].map((step, idx) => {
                    const steps = ['applied', 'shortlisted', 'interviewing', 'offered'];
                    const currentIdx = steps.indexOf(application.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-500"
                        )}>
                          {idx + 1}
                        </div>
                        <span className={cn(
                          "text-xs font-medium capitalize",
                          isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"
                        )}>
                          {step}
                        </span>
                        {idx < 3 && (
                          <div className={cn(
                            "w-8 h-0.5",
                            isCompleted ? "bg-emerald-600" : "bg-slate-200"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-slate-300 w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No applications yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">
            You haven't applied to any jobs yet. Browse recommended jobs and start applying!
          </p>
          <Button onClick={() => window.location.href = '/student/jobs'}>
            Browse Jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
