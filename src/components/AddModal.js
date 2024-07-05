import React from 'react';
import Form from './Form ';

const AddModal = ({fetchUserData}) => {
  
  return (
    <div>
      <button type="button" className="btn btn-success mb-3 mt-3 addBtn" data-bs-toggle="modal" data-bs-target="#regModal">ADD Details</button>
      <div className="modal fade" id="regModal" tabIndex="-1" aria-labelledby="regModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
           <Form fetchUserData={fetchUserData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
