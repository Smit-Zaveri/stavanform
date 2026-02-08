import {
  Box,
  Button,
  TextField,
  Typography,
  Fade,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "./firebase";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      setSuccess("A password reset email has been sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send password reset email. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
      }}
    >
      <Fade in timeout={500}>
        <Box 
          sx={{ 
            width: {
              xs: '100%',
              sm: '380px',
              md: '400px'
            },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 2,
          }}
        >
          <Typography 
            variant="h5" 
            align="center"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#fff',
              mb: 2,
            }}
          >
            Reset Password
          </Typography>

          {success && (
            <Typography 
              variant="body2" 
              align="center"
              sx={{ 
                mb: 1.5,
                color: '#4caf50',
                fontSize: '0.875rem'
              }}
            >
              {success}
            </Typography>
          )}

          {error && (
            <Typography 
              variant="body2" 
              align="center"
              sx={{ 
                mb: 1.5,
                color: '#ff6b6b',
                fontSize: '0.875rem'
              }}
            >
              {error}
            </Typography>
          )}

          <TextField
            placeholder="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#252525',
                height: '50px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: '#fff',
                '&::placeholder': {
                  color: '#666',
                  opacity: 1,
                },
              },
            }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handlePasswordReset}
            disabled={loading || !isValidEmail(email)}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '0.95rem',
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: '#fff',
              color: '#1a1a1a',
              height: '50px',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#999',
              },
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
            <a 
              href="/login" 
              style={{ 
                color: '#666', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#999';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#666';
              }}
            >
              Back to login
            </a>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default ResetPassword;
