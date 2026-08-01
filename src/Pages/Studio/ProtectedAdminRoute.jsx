import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/UserContext";
import { isAdminEmail } from "../../Constants/AdminConfig";

function ProtectedAdminRoute({ children }) {
  const { User } = useContext(AuthContext);

  if (!User) {
    return <Navigate to="/signin" replace />;
  }

  if (!isAdminEmail(User.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
