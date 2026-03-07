import React from "react";

interface Props {
  college: any;
  onClose: () => void;
}

const ViewCollege: React.FC<Props> = ({ college, onClose }) => {
  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between">
        <h5 className="mb-0">View College</h5>
        <button className="btn btn-sm btn-outline-danger" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">College Name</div>
          <div className="col-md-8">{college.name}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">Subdomain</div>
          <div className="col-md-8">{college.subdomain}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 fw-semibold">Admin Email</div>
          <div className="col-md-8">{college.adminEmail}</div>
        </div>
      </div>
    </div>
  );
};

export default ViewCollege;
