import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "./firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate("/"); // Redirect to home page after login
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        padding: { 
          xs: 2,  // 16px padding on extra-small screens
          sm: 3,  // 24px padding on small screens
          md: 4   // 32px padding on medium screens
        },
      }}
    >
      <Card 
        sx={{ 
          width: {
            xs: '100%',    // Full width on mobile
            sm: '450px',   // Fixed width on small screens
            md: '500px'    // Slightly larger on medium screens
          },
          p: { 
            xs: 2,
            sm: 3 
          },
          borderRadius: 1,
        }}
      >
        <CardContent>
          <Typography 
            variant="h4" 
            gutterBottom 
            align="center"
            sx={{
              fontSize: {
                xs: '1.5rem',
                sm: '2rem'
              },
              mb: 3
            }}
          >
            Welcome Back
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3
            }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              py: { 
                xs: 1,
                sm: 1.5 
              },
              fontSize: {
                xs: '0.9rem',
                sm: '1rem'
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 3,
              fontSize: {
                xs: '0.8rem',
                sm: '0.875rem'
              }
            }}
          >
            Forgot your password? <a href="/reset-password">Reset it here</a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
