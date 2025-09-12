import React, { useState, useRef } from 'react';
import logo from '../images/logo.png';

function Create() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    resume: null
  });
  const [notification, setNotification] = useState(null);

  const fileInputRef = useRef(null); // ref for file input

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.resume) {
      setNotification('Please upload a resume.');
      return;
    }

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    data.append('resume', formData.resume);

    try {
      const response = await fetch('http://localhost:8000/api/submit', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Form submitted successfully!');
        setFormData({ firstName: '', lastName: '', email: '', resume: null });
        if (fileInputRef.current) fileInputRef.current.value = null; // reset file input
      } else {
        // backend email exists
        if (result.message && result.message.includes('already exists')) {
          setNotification('This email is already used. Please use a different email.');
        } else {
          setNotification('Error submitting form. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setNotification('Error submitting form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 p-4 pt-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow-md">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="Alma Logo" className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-bold">Alma</h1>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mb-4 text-red-600 font-semibold">{notification}</div>
        )}

        {/* First Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Resume Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Resume Upload</label>
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="hidden"
            id="resume-upload"
            ref={fileInputRef} // attach ref
          />
          <label
            htmlFor="resume-upload"
            className="w-full flex items-center justify-center border-2 border-dashed border-gray-400 rounded p-4 cursor-pointer text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition"
            title="Click to upload your resume"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 6v6" />
            </svg>
            {formData.resume ? formData.resume.name : "Click to upload resume"}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-700 text-white p-2 rounded hover:bg-green-800 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Create;
