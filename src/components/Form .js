import React, { useState, useEffect } from 'react';
import Api from './Api';

export default function Form({fetchUserData}) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    dob: '',
    address: '',
    gender: '',
    country: '',
    state: '',
    hobbies: [],
    fileToUpload: null,
    imageUrl: ''
  });
  
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = () => {
    Api.get('/getCountries')
      .then(response => {
        setCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  };

  const fetchStates = (countryId) => {
    Api.post('/getStates', { country_id: countryId })
      .then(response => {
        setStates(response.data); 
      })
      .catch(error => {
        console.error('Error fetching states:', error);
      });
  };

  const handleCountryChange = (event) => {
    const countryId = event.target.value;
    setSelectedCountry(countryId);
    fetchStates(countryId);
    setSelectedState('');
    setFormData({
      ...formData,
      country: countryId
    });
  };

  const handleStateChange = (event) => {
    const stateName = event.target.value;
    setSelectedState(stateName);
    setFormData({
      ...formData,
      state: stateName
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      const isChecked = checked;
      const hobby = value;

      // Toggle hobbies array based on checkbox change
      setFormData(prevState => ({
        ...prevState,
        hobbies: isChecked
          ? [...prevState.hobbies, hobby]
          : prevState.hobbies.filter(h => h !== hobby)
      }));
    } else if (type === 'file') {
      if (files.length > 0) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({
            ...formData,
            fileToUpload: files[0],
            imageUrl: reader.result 
          });
        };
        reader.readAsDataURL(files[0]);
      } else {
        setFormData({
          ...formData,
          fileToUpload: null,
          imageUrl: '' 
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hobbiesString = formData.hobbies.join(', ');

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'hobbies') {
        formDataToSend.append(key, hobbiesString);
      } else if (key === 'fileToUpload' && value instanceof File) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, value);
      }
    });

    Api.post('/insertData', formDataToSend)
      .then(response => {
        alert('inserted succesfully');
        setTimeout(() => {
          document.getElementById('closeModalButton').click();
        }, 1000); 
     
        setFormData({
          name: '',
          email: '',
          username: '',
          phone: '',
          dob: '',
          address: '',
          gender: '',
          country: '',
          state: '',
          hobbies: [],
          fileToUpload: null,
          imageUrl: ''
        });
        fetchUserData();
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        alert(error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h5 className="modal-title" id="regModalLabel">Registration form</h5>
        <button type="button" id="closeModalButton" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <input type="hidden" name="hidden" id="hiddenId" />
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" placeholder="Enter Your Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
          <div className="invalid-feedback">Please enter a valid name.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">User Name</label>
          <input type="text" className="form-control" placeholder="Enter Your Name" id="username" name="username" value={formData.username} onChange={handleChange} required />
          <div className="invalid-feedback">Please enter a valid Username.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" placeholder="Enter Your Email id" id="email" name="email" value={formData.email} onChange={handleChange} required />
          <div className="invalid-feedback">Please enter a valid email address.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input type="text" className="form-control" placeholder="Enter Phone No" id="phone" maxLength="10" name="phone" value={formData.phone} onChange={handleChange} required />
          <div className="invalid-feedback">Please enter a valid phone number.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="dob" className="form-label">Date Of Birth</label>
          <input type="date" className="form-control" id="dob" name="dob" value={formData.dob} onChange={handleChange} required />
          <div className="invalid-feedback">Please enter a valid date.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea className="form-control" id="address" name="address" placeholder="Enter Address" maxLength="150" value={formData.address} onChange={handleChange} required></textarea>
          <div className="invalid-feedback">Please enter a valid address.</div>
        </div>

        <div className="mb-3">
          <label className="form-label d-block">Gender</label>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="gender" value="Male" id="flexRadioDefault1" onChange={handleChange} required />
            <label className="form-check-label" htmlFor="flexRadioDefault1">MALE</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="gender" value="Female" id="flexRadioDefault2" onChange={handleChange} required />
            <label className="form-check-label" htmlFor="flexRadioDefault2">FEMALE</label>
          </div>
          <div className="valid-feedback">Looks Good.</div>
          <div className="invalid-feedback">Please select a gender.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="country" className="form-label">Country</label>
          <select className="selectize form-select" id="country" name="country" data-live-search="true" value={formData.country} onChange={handleCountryChange} required>
            <option disabled value="">Select country</option>
            {countries.map(country => (
              <option key={country.id} value={country.id}>{country.country_name}</option>
            ))}
          </select>
          <div className="invalid-feedback">Please select your country.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="state" className="form-label">State</label>
          <select className="selectize form-select" id="state" name="state" value={formData.state} onChange={handleStateChange} required>
            <option disabled value="">Select state</option>
            {states.map(state => (
              <option key={state.sid} value={state.sid}>{state.state_name}</option>
            ))}
          </select>
          <div className="invalid-feedback">Please select your state.</div>
        </div>
        <div className="mb-3">
          <label id="hobby-" className="form-label">Hobbies:</label><br />
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="cooking" id="hobby-cooking" name="hobbies[]" onChange={handleChange} />
            <label className="form-check-label" htmlFor="hobby-Cooking">Cooking</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="Travelling" id="hobby-Travelling" name="hobbies[]" onChange={handleChange} />
            <label className="form-check-label" htmlFor="hobby-Travelling">Travelling</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="Reading" id="hobby-Reading" name="hobbies[]" onChange={handleChange} />
            <label className="form-check-label" htmlFor="hobby-Reading">Reading</label>
          </div>
      
          <div className="invalid-feedback" id="feedback">Please select at least one hobby.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="file">Upload Image:</label><br />
          <input type="file" id="fileInput" name="fileToUpload" onChange={handleChange} required /><br /><br />
          <div className="invalid-feedback">Please upload an image.</div>
        </div>
        <div id="imagepreview">
          {formData.imageUrl && (
            <img id="imageprev" src={formData.imageUrl} style={{ width: '50%', height: '50%' }} alt="Preview" />
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-dark" data-bs-dismiss="modal">Close</button>
        <button type="submit" className="btn btn-success">Submit</button>
      </div>

     
    </form>
  );
}
