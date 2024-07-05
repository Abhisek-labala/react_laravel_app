import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Api, { setLoginProcess } from './Api'; // Import setLoginProcess function from Api

export default function Logout() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleClick = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      return;
    }

    Api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        console.log('Logout successful:', res.data);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        Api.defaults.headers.common['Authorization'] = '';

        setLoginProcess(false);
        navigate('/'); 
      })
      .catch((error) => {
        console.error('Logout error:', error);
        setError('Failed to logout');
      });
  };

  return (
    <div>
      {error && <div className="alert alert-danger" role="alert">
        {error}
      </div>}
      <button className='btn btn-danger' onClick={handleClick}>Logout</button>
    </div>
  );
}
