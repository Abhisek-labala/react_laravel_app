import React, { useState ,useEffect} from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import Api, { setLoginProcess } from './Api';
import { useAuth } from './AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { tokenStatus } = useAuth();

  useEffect(() => {
    if (tokenStatus === 'expired') {
      // Notify the user or perform specific actions
      console.warn('Token has expired.');
    }
    if (tokenStatus === 'refreshed') {
      // Notify the user or perform specific actions
      console.log('Token has been refreshed.');
    }
  }, [tokenStatus]);
  const submitForm = () => {
    setLoginProcess(true);
    Api.post('/login', { email, password })
      .then((res) => {
        alert('login succesfull');
        console.log('Login successful:', res.data);
        const { token } = res.data;
        localStorage.setItem('token', token);
        navigate('/admin');
      })
      .catch((error) => {
        console.error('Login error:', error);
        alert('login failed',error);
      })
      .finally(() => {
        setLoginProcess(false);
      });
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-xl-10 col-lg-12 col-md-9" style={{ marginTop: '5rem' }}>
          <div className="card o-hidden border-0 shadow-lg my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                    </div>
                    <form className="user">
                      <div className="form-group">
                        <input
                          type="email"
                          className="form-control form-control-user"
                          id="exampleInputEmail"
                          aria-describedby="emailHelp"
                          placeholder="Enter Email Address..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="password"
                          className="form-control form-control-user"
                          id="exampleInputPassword"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-user btn-block"
                        onClick={submitForm}
                      >
                        Login
                      </button>
                    </form>
                    <hr />
                    <div className="text-center">
                      <Link className="small" to="/signup">
                        Create an Account!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
