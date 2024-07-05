import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./Api";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./Login.css";

const Signup = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const navigate =useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    phone: "",
    dob: "",
    address: "",
    gender: "",
    country: "",
    state: "",
    hobbies: [],
    fileToUpload: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = () => {
    Api.get("/getCountries")
      .then((response) => {
        setCountries(response.data);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  };

  const fetchStates = (countryId) => {
    Api.post("/getStates", { country_id: countryId })
      .then((response) => {
        setStates(response.data);
      })
      .catch((error) => {
        console.error("Error fetching states:", error);
      });
  };

  const handleCountryChange = (event) => {
    const countryId = event.target.value;
    setSelectedCountry(countryId);
    fetchStates(countryId);
    setSelectedState("");
    setFormData({
      ...formData,
      country: countryId,
    });
  };

  const handleStateChange = (event) => {
    const stateName = event.target.value;
    setSelectedState(stateName);
    setFormData({
      ...formData,
      state: stateName,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        hobbies: checked
          ? [...prev.hobbies, value]
          : prev.hobbies.filter((hobby) => hobby !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "file" ? e.target.files[0] : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      fileToUpload: file,
    }));
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "hobbies") {
        formData[key].forEach((hobby) => data.append("hobbies[]", hobby));
      } else {
        data.append(key, formData[key]);
      }
    });
    try {
      await Api.post("/register", data)
      .then((res) => {
        console.log('Register successful:', res.data);
        navigate('/');
      })
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container">
      <div className="card o-hidden border-0 shadow-lg my-5">
        <div className="card-body p-0">
          <div className="p-5">
            <div className="text-center">
              <h1 className="h4 text-gray-900 mb-4">Create an Account!</h1>
            </div>
            <form
              id="SignupForm"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              <div className="form-group row">
                <div className="col-sm-6 mb-sm-0">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Your Name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter your name.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-user"
                    placeholder="Enter Your Email id"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter a valid email address.
                  </div>
                </div>
                <div className="col-sm-6 mb-sm-0">
                  <label htmlFor="username" className="form-label">
                    User Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Your User Name"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter User name.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-user"
                    placeholder="Enter Your password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter a valid password.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="password_confirmation" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-user"
                    placeholder="Confirm Your password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please confirm your password.
                  </div>
                </div>
                <div className="col-sm-6 mb-sm-0">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Your Phone Number"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter your phone number.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="dob" className="form-label">
                    DOB
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-user"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Please enter your DOB.</div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-user"
                    placeholder="Enter Your Address"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter your Address.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    className="form-control form-control-user"
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <div className="invalid-feedback">
                    Please select your gender.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select
                    className="form-control form-control-user"
                    id="country"
                    name="country"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    Please select your country.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <select
                    className="form-control form-control-user"
                    id="state"
                    name="state"
                    value={selectedState}
                    onChange={handleStateChange}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.sid} value={state.sid}>
                        {state.state_name}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    Please select your state.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="hobbies" className="form-label">
                    Hobbies
                  </label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hobbies_reading"
                      name="hobbies[]"
                      value="Reading"
                      checked={formData.hobbies.includes("Reading")}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="hobbies_reading"
                    >
                      Reading
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hobbies_traveling"
                      name="hobbies[]"
                      value="Traveling"
                      checked={formData.hobbies.includes("Traveling")}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="hobbies_traveling"
                    >
                      Traveling
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hobbies_cooking"
                      name="hobbies[]"
                      value="cooking"
                      checked={formData.hobbies.includes("cooking")}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="hobbies_cooking"
                    >
                      Cooking
                    </label>
                  </div>
                  <div className="invalid-feedback">
                    Please select your hobbies.
                  </div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="fileToUpload" className="form-label">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="fileToUpload"
                    name="fileToUpload"
                    onChange={handleFileChange}
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="Profile Preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        marginTop: "10px",
                      }}
                    />
                  )}
                  <div className="invalid-feedback">
                    Please upload a valid image file.
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-user btn-block"
              >
                Register Account
              </button>
            </form>
            <hr />
            <div className="text-center">
              <a className="small" href="/forgot-password">
                Forgot Password?
              </a>
            </div>
            <div className="text-center">
              <a className="small" href="/">
                Already have an account? Login!
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
