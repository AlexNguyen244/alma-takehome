import React, { useState } from 'react';
import logo from '../images/logo.png';

function Create() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    resume: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent React Router form default behavior

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

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        alert('Form submitted successfully!');
      } else {
        console.error('Error submitting form');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <header className="flex flex-col items-center mb-8">
        <img src={logo} alt="Alma Logo" className="w-24 h-24 mb-2" />
        <h1 className="text-3xl font-bold">Alma</h1>
      </header>

      <div className="mb-4 w-full max-w-md">
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

      <div className="mb-4 w-full max-w-md">
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

      <div className="mb-4 w-full max-w-md">
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

      <div className="mb-4 w-full max-w-md">
        <label className="block text-gray-700 mb-1">Resume Upload</label>
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      <button type="submit" className="w-full max-w-md bg-green-700 text-white p-2 rounded hover:bg-green-800">
        Submit
      </button>
    </form>
  );
}

export default Create;