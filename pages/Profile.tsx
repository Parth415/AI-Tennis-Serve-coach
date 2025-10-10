
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const SERVE_GOALS_OPTIONS = [
  'Increase Serve Speed',
  'Improve First Serve Percentage',
  'Improve Slice Serve',
  'Improve Kick Serve',
  'Reduce Double Faults',
];

const Profile: React.FC<ProfileProps> = ({ userProfile, setUserProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? (value === '' ? '' : parseInt(value, 10)) : value }));
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
        const currentGoals = prev.serveGoals || [];
        if (checked) {
            return { ...prev, serveGoals: [...currentGoals, value] };
        } else {
            return { ...prev, serveGoals: currentGoals.filter(goal => goal !== value) };
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Your Profile</h2>
        <p className="text-gray-600 mb-6">This information helps the AI coach provide more personalized feedback.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={labelClasses}>Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="e.g., Alex"
            />
          </div>
          
          <div>
            <label htmlFor="age" className={labelClasses}>Age</label>
            <input
              type="number"
              name="age"
              id="age"
              value={formData.age}
              onChange={handleChange}
              className={inputClasses}
              placeholder="e.g., 25"
            />
          </div>

          <div>
            <label htmlFor="skillLevel" className={labelClasses}>Skill Level</label>
            <select
              name="skillLevel"
              id="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Select...</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Playing Hand</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="playingHand"
                  value="Right"
                  checked={formData.playingHand === 'Right'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <span className="ml-2 text-gray-700">Right</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="playingHand"
                  value="Left"
                  checked={formData.playingHand === 'Left'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <span className="ml-2 text-gray-700">Left</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="preferredCourtSurface" className={labelClasses}>Preferred Court Surface</label>
            <select
              name="preferredCourtSurface"
              id="preferredCourtSurface"
              value={formData.preferredCourtSurface || ''}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Select...</option>
              <option value="Hard">Hard</option>
              <option value="Clay">Clay</option>
              <option value="Grass">Grass</option>
            </select>
          </div>

          <div>
            <label htmlFor="racquetType" className={labelClasses}>Racquet Type</label>
            <input
              type="text"
              name="racquetType"
              id="racquetType"
              value={formData.racquetType || ''}
              onChange={handleChange}
              className={inputClasses}
              placeholder="e.g., Babolat Pure Aero"
            />
          </div>

          <div>
            <label className={labelClasses}>Primary Serve Goals</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {SERVE_GOALS_OPTIONS.map(goal => (
                <label key={goal} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="serveGoals"
                    value={goal}
                    checked={(formData.serveGoals || []).includes(goal)}
                    onChange={handleGoalChange}
                    className="form-checkbox h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            {isSaved && <p className="text-sm text-green-600 mr-4">Profile saved!</p>}
            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
