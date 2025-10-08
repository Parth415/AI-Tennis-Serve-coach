
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";
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
