import {
  Box,
  Button,
  TextField,
  Typography,
  Fade,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "./firebase";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <>
      <style>{`
        @keyframes autofill {
          to {
            background: #252525;
            color: #fff;
          }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #252525 inset !important;
          -webkit-text-fill-color: #fff !important;
          box-shadow: 0 0 0 1000px #252525 inset !important;
          caret-color: #fff !important;
          border-radius: 8px !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: '#0a0a0a',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.08) 20%, transparent 50%)`,
            pointerEvents: 'none',
            transition: 'background 0.1s ease-out',
          },
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
    </>
  );
};

export default ResetPassword;
