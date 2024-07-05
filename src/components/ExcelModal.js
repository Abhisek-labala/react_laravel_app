import React, { useState } from 'react';
import Api from './Api';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min';

function ExcelModal({ fetchUserData }) {
  const [validationMessages, setValidationMessages] = useState([]);
  const [excelData, setExcelData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadEnabled, setUploadEnabled] = useState(false); // State to manage button activation

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePreview = async () => {
    const formData = new FormData();
    formData.append('spreadsheetfile', file);

    try {
      const response = await Api.post('/excelValidation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Preview response:', response.data);

      if (response.data.errors) {
        console.log('Validation errors:', response.data.errors);
        setValidationMessages(response.data.errors);
        setExcelData(null);
        setUploadEnabled(false); // Disable upload button if preview fails
      } else {
        setExcelData(response.data.excelData.slice(0, 5));
        setValidationMessages([]);
        setUploadEnabled(true); // Enable upload button if preview is successful
      }
    } catch (error) {
      console.error('There was an error uploading the file!', error);
      if (error.response && error.response.data && error.response.data.errors) {
        console.log('Error response data errors:', error.response.data.errors);
        setValidationMessages(error.response.data.errors);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await Api({
        url: '/generate-excel',
        method: 'GET',
        responseType: 'blob', // Important for handling binary data
      });

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('There was an error downloading the template!', error);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('spreadsheetfile', file);

    try {
      const response = await Api.post('/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      setExcelData(null);
      setFile(null);
      setUploadEnabled(false);
      alert('File uploaded successfully!');
      const modalElement = document.getElementById('spreadModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
      fetchUserData();
    } catch (error) {
      console.error('There was an error uploading the file!', error);
      alert('Upload failed. Please try again.');
      if (error.response && error.response.data && error.response.data.errors) {
        console.log('Error response data errors:', error.response.data.errors);
        setValidationMessages(error.response.data.errors);
      }
    }
  };

  return (
    <div>
      <button type="button" className="btn btn-primary m-3" data-bs-toggle="modal" data-bs-target="#spreadModal">
        Upload File
      </button>

      <div className="modal fade" id="spreadModal" tabIndex="-1" aria-labelledby="spreadModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="spreadModalLabel">Upload Excel</h1>
              <button type="button" className="btn-close" id="closeModalButton" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <a href="#" onClick={handleDownloadTemplate}>
                Click here
              </a>{' '}
              to Download Template.
              <form id="uploadForm" encType="multipart/form-data" onSubmit={(e) => e.preventDefault()}>
                <div className="m-2">
                  <label htmlFor="spreadsheetfile">Upload File</label>
                  <br />
                  <input type="file" id="spreadsheetfile" name="spreadsheetfile" onChange={handleFileChange} />
                  <br />
                  <br />
                </div>

                <div id="validationMessages">
                  {validationMessages.length > 0 &&
                    validationMessages.map((msg, index) => (
                      <div key={index} className="alert alert-danger">
                        {msg}
                      </div>
                    ))}
                </div>
                <div id="excelTable">
                  {excelData && excelData.length > 0 && (
                    <table className="table">
                      <thead>
                        <tr>
                          {Object.keys(excelData[0]).map((key, index) => (
                            <th key={index}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.keys(row).map((key, colIndex) => (
                              <td key={colIndex}>{row[key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success" id="upload" onClick={handleUpload} disabled={!uploadEnabled}>
                    Upload
                  </button>
                  <button type="button" className="btn btn-primary" id="preview" onClick={handlePreview}>
                    Preview
                  </button>
                  <br />
                  <br />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExcelModal;
