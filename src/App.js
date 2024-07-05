import React from 'react';
import './App.css';
import Admin from './components/Admin';
import Login from './components/Login';
import {Route,Routes } from 'react-router-dom';
import Signup from './components/Signup';

function App() {
  return (
    <div className="App">
      <Routes >
        <Route exact path='/' element={<Login />} />
        <Route exact path='/admin' element={<Admin />}/>
        <Route exact path='/signup' element={<Signup />}/>
        <Route exact path='/logout' element={<Login />}/>
      </Routes>
    </div>
  );
}

export default App;
