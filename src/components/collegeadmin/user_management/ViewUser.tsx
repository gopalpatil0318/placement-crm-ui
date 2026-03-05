import React from "react";

interface Props {
  user: any;
  onClose: () => void;
}

const ViewUser: React.FC<Props> = ({ user, onClose }) => {
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between">
        <h5 className="mb-0">View User Details</h5>
        <button className="btn btn-sm btn-outline-danger" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">Full Name</div>
          <div className="col-md-8">{user.name}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">Email Address</div>
          <div className="col-md-8">{user.email}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">Contact Number</div>
          <div className="col-md-8">{user.phone || "N/A"}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">Role</div>
          <div className="col-md-8 text-capitalize">{user.role || "Admin"}</div>
        </div>

        {user.collegeName && (
          <div className="row mb-3">
            <div className="col-md-4 fw-semibold">Associated College</div>
            <div className="col-md-8">{user.collegeName}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUser;
