import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '../services/api';

interface RecruiterInfo {
  name: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string;
}

interface CompanyInfo {
  name: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  size?: string;
  location?: string;
  foundedYear?: number;
  description?: string;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  shortlistedStudents: number;
}

interface JobSummary {
  id: string;
  title: string;
  location: string;
  applicants: number;
  isActive: boolean;
}

interface ApplicationSummary {
  id: string;
  studentName: string;
  skills: string[];
  resumeUrl?: string;
  jobTitle: string;
  appliedDate: string;
}

interface ProfileResponse {
  recruiter: RecruiterInfo;
  company: CompanyInfo;
  stats: Stats;
  recentJobs: JobSummary[];
  recentApplications: ApplicationSummary[];
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

// reusable components
const ProfileCard: React.FC<{ info: RecruiterInfo }> = ({ info }) => (
  <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center text-center">
    <img
      src={info.profilePhotoUrl || '/placeholder-profile.png'}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover mb-4"
    />
    <h2 className="text-xl font-semibold">{info.name}</h2>
    <p className="text-sm text-gray-500">{info.email}</p>
    <p className="text-sm text-gray-500">{info.phone || 'N/A'}</p>
  </div>
);

const CompanyDetails: React.FC<{ company: CompanyInfo }> = ({ company }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center mb-4">
      <img
        src={company.logoUrl || '/placeholder-logo.png'}
        alt="Logo"
        className="w-16 h-16 object-contain mr-4"
      />
      <div>
        <h2 className="text-xl font-semibold">{company.name}</h2>
        <p className="text-sm text-gray-500">{company.industry || 'Industry not set'}</p>
      </div>
    </div>
    <p className="text-sm"><strong>Website:</strong> {company.website || 'N/A'}</p>
    <p className="text-sm"><strong>Size:</strong> {company.size || 'N/A'}</p>
    <p className="text-sm"><strong>Location:</strong> {company.location || 'N/A'}</p>
    <p className="text-sm mt-2">{company.description || 'No description provided.'}</p>
  </div>
);

const StatisticsCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-white p-4 rounded-lg shadow text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const JobList: React.FC<{ jobs: JobSummary[] }> = ({ jobs }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-2">Recent Jobs</h3>
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-2">Title</th>
          <th className="p-2">Location</th>
          <th className="p-2">Applicants</th>
          <th className="p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((j) => (
          <tr key={j.id} className="border-t hover:bg-gray-50">
            <td className="p-2">{j.title}</td>
            <td className="p-2">{j.location}</td>
            <td className="p-2">{j.applicants}</td>
            <td className="p-2">{j.isActive ? 'Active' : 'Closed'}</td>
          </tr>
        ))}
        {jobs.length === 0 && (
          <tr>
            <td colSpan={4} className="p-4 text-center text-gray-500">
              No jobs to display.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const ApplicationList: React.FC<{ apps: ApplicationSummary[] }> = ({ apps }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-2">Recent Applications</h3>
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-2">Student</th>
          <th className="p-2">Skills</th>
          <th className="p-2">Job</th>
          <th className="p-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {apps.map((a) => (
          <tr key={a.id} className="border-t hover:bg-gray-50">
            <td className="p-2">{a.studentName}</td>
            <td className="p-2">{a.skills.join(', ')}</td>
            <td className="p-2">{a.jobTitle}</td>
            <td className="p-2">{new Date(a.appliedDate).toLocaleDateString()}</td>
          </tr>
        ))}
        {apps.length === 0 && (
          <tr>
            <td colSpan={4} className="p-4 text-center text-gray-500">
              No applications to display.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// main page component

const RecruiterProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // editing state
  const [editing, setEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<Partial<ProfileResponse>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.get('/recruiters/profile');
      const data: ProfileResponse = resp.data;
      setProfile(data);
      setFormValues(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // recruiter fields: phone
    const recruiterFields = ['phone'];
    if (recruiterFields.includes(name)) {
      setFormValues((prev) => ({
        ...prev,
        recruiter: { ...prev.recruiter, [name]: value },
      } as Partial<ProfileResponse>));
    } else {
      // company fields
      setFormValues((prev) => ({
        ...prev,
        company: { ...prev.company, [name]: value },
      } as Partial<ProfileResponse>));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'logo') => {
    const file = e.target.files?.[0] || null;
    if (type === 'photo') {
      setPhotoFile(file);
      setPhotoPreview(file ? URL.createObjectURL(file) : '');
    } else {
      setLogoFile(file);
      setLogoPreview(file ? URL.createObjectURL(file) : '');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // upload files first if present
      if (photoFile) {
        const form = new FormData();
        form.append('photo', photoFile);
        await api.post('/recruiters/upload-profile-photo', form);
      }
      if (logoFile) {
        const form = new FormData();
        form.append('logo', logoFile);
        await api.post('/recruiters/upload-logo', form);
      }
      // then update profile
      await api.put('/recruiters/profile', formValues);
      
      await fetchProfile();
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!profile) {
    return null;
  }

  const { recruiter, company, stats, recentJobs, recentApplications, verificationStatus } = profile;

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!editing && (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* verification status */}
      <div className="bg-white p-4 rounded shadow">
        <span className="font-medium">Verification:&nbsp;</span>
        {verificationStatus === 'verified' ? (
          <span className="text-green-600">Verified</span>
        ) : verificationStatus === 'pending' ? (
          <span className="text-yellow-500">Pending approval</span>
        ) : (
          <span className="text-red-600">Rejected</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <ProfileCard info={recruiter} />
          <CompanyDetails company={company} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatisticsCard label="Jobs Posted" value={stats.totalJobs} />
            <StatisticsCard label="Active Jobs" value={stats.activeJobs} />
            <StatisticsCard label="Applications" value={stats.totalApplications} />
            <StatisticsCard label="Shortlisted" value={stats.shortlistedStudents} />
          </div>

          {/* recent jobs & applications */}
          <JobList jobs={recentJobs} />
          <ApplicationList apps={recentApplications} />
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Phone number</label>
              <input
                name="phone"
                value={formValues.recruiter?.phone || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Profile photo</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
              {photoPreview && <img src={photoPreview} className="w-24 h-24 rounded-full mt-2" />}
            </div>
            <div>
              <label className="block text-sm font-medium">Company logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
              {logoPreview && <img src={logoPreview} className="w-24 h-24 mt-2" />}
            </div>
            <div>
              <label className="block text-sm font-medium">Company website</label>
              <input
                name="website"
                value={formValues.company?.website || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company size</label>
              <input
                name="size"
                value={formValues.company?.size || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company location</label>
              <input
                name="location"
                value={formValues.company?.location || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Company description</label>
              <textarea
                name="description"
                value={formValues.company?.description || ''}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecruiterProfile;
