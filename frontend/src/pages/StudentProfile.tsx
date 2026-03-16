import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { studentService } from '../services/studentService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const getAbsoluteResumeUrl = (resumePathOrUrl?: string) => {
  if (!resumePathOrUrl) return '';
  if (/^https?:\/\//i.test(resumePathOrUrl)) return resumePathOrUrl;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');
  const normalizedPath = resumePathOrUrl.startsWith('/') ? resumePathOrUrl : `/${resumePathOrUrl}`;
  return `${apiOrigin}${normalizedPath}`;
};

const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<StudentProfile>>({
    fullName: '',
    phone: '',
    college: '',
    branch: '',
    graduationYear: undefined,
    skills: [],
    resumePath: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await studentService.getProfile();
      setProfile({
        ...profileData,
        resumePath: profileData.resumePath || profileData.resumeUrl || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (skillsString: string) => {
    const skills = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfile(prev => ({
      ...prev,
      skills
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updatedProfile = await studentService.updateProfile(profile);
      setProfile(updatedProfile);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploadingResume(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await studentService.uploadResume(formData);

    const parsed = (response.profile as any).parsedResumeData;

    setProfile(prev => ({
      ...prev,
      fullName: parsed?.name || prev.fullName,
      phone: parsed?.phone || prev.phone,
      skills: parsed?.skills || [],
      graduationYear: parsed?.education?.[0]?.end_year
        ? parseInt(parsed.education[0].end_year)
        : prev.graduationYear,
      resumePath: response.profile.resumePath || response.profile.resumeUrl,
      resumeUrl: response.profile.resumeUrl || response.profile.resumePath,
    }));

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);

  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to upload resume");
  } finally {
    setUploadingResume(false);
    e.target.value = "";
  }
};

  const handleViewResume = () => {
    const resumePathOrUrl = profile.resumeUrl || profile.resumePath;
    if (resumePathOrUrl) {
      const resumeUrl = getAbsoluteResumeUrl(resumePathOrUrl);
      window.open(resumeUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Full Name"
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div>
              <Input
                label="College/University"
                type="text"
                value={profile.college || ''}
                onChange={(e) => handleInputChange('college', e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Branch"
                type="text"
                value={profile.branch || ''}
                onChange={(e) => handleInputChange('branch', e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Graduation Year"
                type="number"
                value={profile.graduationYear || ''}
                onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={profile.skills?.join(', ') || ''}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js, Python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume
            </label>
            {(profile.resumePath || profile.resumeUrl) ? (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Resume uploaded</p>
                  <p className="text-xs text-gray-500">
                    {(profile.resumePath || profile.resumeUrl || '').split('/').pop()}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleViewResume}
                  className="px-4 py-2 text-sm"
                >
                  View Resume
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-2">No resume uploaded yet</p>
            )}
            
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {(profile.resumePath || profile.resumeUrl) ? 'Upload New Resume' : 'Upload Resume'} (PDF only, max 5MB)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingResume && (
                <p className="text-sm text-blue-600 mt-1">Uploading...</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="px-6 py-2"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
