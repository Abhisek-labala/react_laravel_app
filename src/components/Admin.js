import React, { useEffect, useState } from 'react';
import Datatable from './Datatable';
import Login from './Login'; // Assuming you have a Login component

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');

    if (jwtToken) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div>
      {isLoggedIn ? (
        <Admin />
      ) : (
        <Login />
      )}
    </div>
  );
}

function Admin() {
  return (
    <div>
      <Datatable />
    </div>
  );
}
