import React, { useState } from 'react';
import { Technique, UserData } from '../types';
import { translations } from '../localization';

interface UserInfoFormProps {
  technique: Technique;
  onSubmit: (data: Omit<UserData, 'language'>) => void;
  language: string;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ technique, onSubmit, language }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
  });

  const T = translations[language] || translations['en'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.dob && formData.tob && formData.pob) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-indigo-950/40 p-8 rounded-2xl border border-indigo-800/50 shadow-2xl animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-purple-300">{T.formTitle}</h2>
        <p className="text-gray-400 mt-2">
          {T.formSubtitle(technique.name)}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{T.formNameLabel}</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-indigo-900 border border-indigo-700 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-shadow" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-300 mb-1">{T.formDobLabel}</label>
                <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} required className="w-full bg-indigo-900 border border-indigo-700 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-shadow" />
            </div>
            <div>
                <label htmlFor="tob" className="block text-sm font-medium text-gray-300 mb-1">{T.formTobLabel}</label>
                <input type="time" name="tob" id="tob" value={formData.tob} onChange={handleChange} required className="w-full bg-indigo-900 border border-indigo-700 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-shadow" />
            </div>
        </div>
        <div>
          <label htmlFor="pob" className="block text-sm font-medium text-gray-300 mb-1">{T.formPobLabel}</label>
          <input type="text" name="pob" id="pob" value={formData.pob} onChange={handleChange} required className="w-full bg-indigo-900 border border-indigo-700 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-shadow" />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500">
          {T.formButton}
        </button>
      </form>
    </div>
  );
};

export default UserInfoForm;