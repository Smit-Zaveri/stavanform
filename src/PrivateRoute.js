import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase";  // Firebase authentication

const PrivateRoute = ({ children }) => {
  const user = auth.currentUser;  // Check if the user is authenticated

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
