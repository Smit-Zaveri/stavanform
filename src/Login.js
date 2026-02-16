import {
  Box,
  Button,
  TextField,
  Typography,
  Fade,
  InputAdornment,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "./firebase";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigate("/");
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

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
            Log in to Stavan
          </Typography>

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
            sx={{
              mb: 1.5,
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
                '&:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px #252525 inset',
                  WebkitTextFillColor: '#fff',
                  caretColor: '#fff',
                  borderRadius: '8px',
                },
                '&:-webkit-autofill:hover': {
                  WebkitBoxShadow: '0 0 0 1000px #252525 inset',
                  WebkitTextFillColor: '#fff',
                },
                '&:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 1000px #252525 inset',
                  WebkitTextFillColor: '#fff',
                },
              },
            }}
          />

          <TextField
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{ color: '#666' }}
                  >
                    {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1.5,
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
                '&:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px #252525 inset',
                  WebkitTextFillColor: '#fff',
                  caretColor: '#fff',
                  borderRadius: '8px',
                },
                '&:-webkit-autofill:hover': {
                  WebkitBoxShadow: '0 0 0 1000px #252525 inset',
                  WebkitTextFillColor: '#fff',
                },
                '&:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 1000px #252525 inset',
                  WebkitTextFillColor: '#fff',
                },
              },
            }}
          />

          <Box sx={{ width: '100%', textAlign: 'right', mb: 2 }}>
            <a 
              href="/reset-password" 
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
              Forgot your password?
            </a>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
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
            {loading ? 'Loading...' : 'Log in'}
          </Button>
        </Box>
      </Fade>
    </Box>
    </>
  );
};

export default Login;
