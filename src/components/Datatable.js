import React, { useEffect, useState, useRef } from "react";
import Api from "./Api";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-dt";
import "bootstrap/dist/css/bootstrap.min.css";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import Edituser from "./Edituser";
import { useAuth } from "./AuthContext";
import { b64toBlob } from '../helper/helper';
import Navbar from "./Navbar";

export default function Datatable() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const tableRef = useRef(null);
  const { tokenStatus } = useAuth();

  useEffect(() => {
    if (tokenStatus === 'expired') {
      console.warn('Token has expired.');
    }
    if (tokenStatus === 'refreshed') {
      console.log('Token has been refreshed.');
    }
  }, [tokenStatus]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!tableRef.current) return;

    $(tableRef.current).on('click', '.deleteBtn', function () {
      const userId = $(this).data('id');
      Api.delete(`/deleteData/${userId}`)
        .then(response => {
          console.log(response.data);
          fetchUserData();
        })
        .catch(error => {
          console.error('Error deleting user:', error);
        });
    });

    $("#myTable").on("click", ".editBtn", function () {
      const userId = $(this).data("id");
      const userToEdit = users.find(user => user.id === userId);
      setEditUser(userToEdit);
      const modal = new bootstrap.Modal(document.getElementById('updateModal'));
      modal.show();
    });

    $("#myTable").on("click", ".downloadBtn", function () {
      const userId = $(this).data("id");
      const userToDownload = users.find(user => user.id === userId);

      Api.post('/generateCertificate', { requestData: { Name: userToDownload.name, Rollno: userToDownload.id } })
        .then(response => {
          const blob = b64toBlob(response.data.pdf_content, 'application/pdf');
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        })
        .catch(error => {
          console.error('Error generating certificate:', error);
        });
    });

    return () => {
      $(tableRef.current).off('click');
    };
  }, [users]);

  const fetchUserData = () => {
    Api.get('/getData')
      .then(response => {
        setUsers(response.data);
        initializeDataTable(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const initializeDataTable = (data) => {
    if ($.fn.DataTable.isDataTable('#myTable')) {
      $('#myTable').DataTable().destroy();
    }

    $('#myTable').DataTable({
      data: data.map(user => [
        user.id,
        user.name,
        user.email,
        user.dob,
        user.gender,
        user.country,
        user.state,
        user.address,
        user.hobbies,
        `<img src="http://127.0.0.1:8000/${user.image_url}" alt="User Image" style="width: 50px; height: 50px; object-fit: cover;" />`
      ]),
      columns: [
        { title: 'ID' },
        { title: 'Name' },
        { title: 'Email' },
        { title: 'DOB' },
        { title: 'Gender' },
        { title: 'Country' },
        { title: 'State' },
        { title: 'Address' },
        { title: 'Hobbies' },
        { title: 'Image' },
        {
          title: 'Actions',
          data: null,
          render: function (data, type, row) {
            const editButton = `<button class="editBtn btn btn-primary m-1" data-id="${row[0]}">Edit</button>`;
            const deleteButton = `<button class="deleteBtn btn btn-danger m-1" data-id="${row[0]}">Delete</button>`;
            const downloadButton = `<button class="downloadBtn btn btn-success m-1" data-id="${row[0]}">Download Certificate</button>`;
            return editButton + ' ' + deleteButton + ' ' + downloadButton;
          }
        }
      ],
      responsive: true,
    });
  };

  return (
    <div className='container-fluid'>
         <Navbar fetchUserData={fetchUserData} />
      <div id="tableContainer" style={{ width: '100%', color: '#fff' }}>
        <table id="myTable" ref={tableRef} className="display" style={{ width: '100%', color: '#fff' ,backgroundColor:'#000', opacity:'0.9' }}>
          {/* Table body will be populated dynamically */}
        </table>
      </div>
      <Edituser user={editUser} fetchUserData={fetchUserData} />
    </div>
  );
}


