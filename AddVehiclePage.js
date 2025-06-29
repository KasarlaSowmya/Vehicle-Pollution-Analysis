import React, { useState } from 'react';
import axios from 'axios';
import { useOwner } from '../context/OwnerContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function AddVehiclePage() {
  const { ownerId } = useOwner(); // ✅ Owner ID passed from context
  const [vehicle, setVehicle] = useState({
    number: '',
    type: '',
    fuel: '',
    age: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: value });
  };

  const submitVehicle = async () => {
    const { number, type, fuel, age } = vehicle;

    if (!number || !type || !fuel || !age || !ownerId) {
      alert('❗ Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/add-vehicle', {
        number: number.trim(),
        type,
        fuel,
        age: parseInt(age),
        ownerId
      });

      alert(response.data.message || '✅ Vehicle added successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error("❌ Error adding vehicle:", error.response?.data || error.message);
      alert("Server Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <h2>Add Vehicle</h2>

      <input
        type="text"
        name="number"
        placeholder="Vehicle Number"
        value={vehicle.number}
        onChange={handleChange}
      />

      <select name="type" value={vehicle.type} onChange={handleChange}>
        <option value="">Select Vehicle Type</option>
        <option>Car</option>
        <option>Bike</option>
        <option>Scooty</option>
        <option>Auto</option>
        <option>Bus</option>
        <option>Lorry</option> {/* ✅ Lorry added */}
      </select>

      <select name="fuel" value={vehicle.fuel} onChange={handleChange}>
        <option value="">Select Fuel Type</option>
        <option>Petrol</option>
        <option>Diesel</option>
        <option>Electric</option>
        <option>CNG</option> {/* ✅ CNG added */}
      </select>

      <input
        type="number"
        name="age"
        placeholder="Vehicle Age"
        value={vehicle.age}
        onChange={handleChange}
      />

      <button onClick={submitVehicle}>Go to Dashboard</button>
    </div>
  );
}
