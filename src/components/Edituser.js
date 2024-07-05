import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Api from "./Api";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

function Edituser({ user, fetchUserData }) {
  const [formData, setFormData] = useState({
    hidden: "",
    username: "",
    fullname: "",
    dob: "",
    address: "",
    gender: "",
    country: "",
    hobbies: [],
    userimage: null,
  });
  const [countries, setCountries] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        hidden: user.id || "",
        username: user.username || "",
        fullname: user.name || "",
        dob: user.dob || "",
        address: user.address || "",
        gender: user.gender || "",
        country: user.country || "",
        hobbies: user.hobbies ? user.hobbies.split(',').map(item => item.trim()) : [],
        userimage: user.userimage || null,
      });
      setImagePreview(user.userimage ? `http://127.0.0.1:8000/${user.userimage}` : null);
    }
  }, [user]);

  const fetchCountries = () => {
    Api.get('/getCountries')
      .then(response => {
        setCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  };

  const handleHobbyChange = (e) => {
    const { value, checked } = e.target;
    if (checked && !formData.hobbies.includes(value)) {
      setFormData({ ...formData, hobbies: [...formData.hobbies, value] });
    } else {
      setFormData({ ...formData, hobbies: formData.hobbies.filter((hobby) => hobby !== value) });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, userimage: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in formData) {
      if (key === 'hobbies') {
        data.append(key, formData[key].join(', '));
      } else {
        data.append(key, formData[key]);
      }
    }

    Api.post("/updateData", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        console.log("User updated successfully:", response.data);
        const modalElement = document.getElementById("updateModal");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        fetchUserData(); // Update parent component state
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };

  return (
    <div className="modal fade" id="updateModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Edit User Form</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body container-fluid">
            <form id="userForm" onSubmit={handleSubmit}>
              <div className="modal-body">
                <input type="hidden" id="hidden" name="hidden" value={formData.id} hidden />
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" name="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="fullname">Full Name</label>
                  <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={(e) => setFormData({ ...formData, fullname: e.target.value })} className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input type="date" id="dob" name="dob" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="form-control" />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea name="address" id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="form-control"></textarea>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="gender" id="genderMale" value="Male" checked={formData.gender === 'Male'} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
                    <label className="form-check-label" htmlFor="genderMale">Male</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="gender" id="genderFemale" value="Female" checked={formData.gender === 'Female'} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
                    <label className="form-check-label" htmlFor="genderFemale">Female</label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select id="country" name="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="form-control">
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>{country.country_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hobbies</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="hobbyReading" value="Reading" checked={formData.hobbies.includes('Reading')} onChange={handleHobbyChange} />
                    <label className="form-check-label" htmlFor="hobbyReading">Reading</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="hobbyTraveling" value="Travelling" checked={formData.hobbies.includes('Travelling')} onChange={handleHobbyChange} />
                    <label className="form-check-label" htmlFor="hobbyTraveling">Traveling</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="hobbyCooking" value="Cooking" checked={formData.hobbies.includes('Cooking')} onChange={handleHobbyChange} />
                    <label className="form-check-label" htmlFor="hobbyCooking">Cooking</label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image</label>
                  <input type="file" id="image" name="image" onChange={handleImageChange} className="form-control" />
                  {imagePreview && (
                    <img src={imagePreview} alt="User" style={{ width: "100px", height: "100px", objectFit: "cover" }} />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Edituser;
