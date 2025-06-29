import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useOwner } from '../context/OwnerContext';
import '../App.css';

export default function AddOwnerPage() {
  const [owner, setOwner] = useState({
    id: '',
    name: '',
    area: '',
    email: ''
  });

  const { setOwnerId } = useOwner();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwner(prev => ({ ...prev, [name]: value }));
  };

  const submitOwner = async () => {
    const { id, name, area, email } = owner;

    // ✅ Validate all fields
    if (!id || !name || !area || !email) {
      alert('❗ Please fill in all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/add-owner', {
        id: id.trim(),
        name: name.trim(),
        area: area.trim(),
        email: email.trim()
      });

      alert(res.data.message || 'Owner added successfully');
      setOwnerId(id.trim()); // Store in context for next page
      navigate('/add-vehicle');
    } catch (err) {
      console.error('❌ Error adding owner:', err.response?.data || err.message);
      alert('Server Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container">
      <h2>Add Owner</h2>
      <input
        type="text"
        name="id"
        placeholder="Owner ID"
        value={owner.id}
        onChange={handleChange}
      />
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={owner.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="area"
        placeholder="Area"
        value={owner.area}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={owner.email}
        onChange={handleChange}
      />
      <button onClick={submitOwner}>Next</button>
    </div>
  );
}
