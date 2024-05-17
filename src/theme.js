import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const styles = {
  topAppBar: {
    backgroundColor: "#fff", // White background
    color: "#000", // Black text
    boxShadow: "none", // Remove the default shadow
    marginBottom: 0, // Remove default bottom margin
  },
  bottomAppBar: {
    backgroundColor: "#333", // Dark gray color
    color: "#fff", // White text
    boxShadow: "none", // Remove the default shadow
    top: "auto",
    bottom: 0,
  },
  menuButton: {
    marginLeft: "auto",
  },
  userInputBox: {
    width: "90%",
    height: "50px", // Adjust the height as needed
    margin: "auto",
    marginTop: "20px",
    marginBottom: "20px", // Add bottom margin to separate from footer app bar
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "vertical", // Allow vertical resizing
  },
  buttonRow: {
    width: "90%", // Match the width of the input box
    margin: "auto", // Center the button row horizontally
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  button: {
    borderRadius: "5px",
    padding: "10px 20px",
    fontWeight: "bold",
  },
  evaluateButton: {
    backgroundColor: "#ddd", // Light grayish color
    color: "#000", // Black text
  },
  evaluateWithTokenButton: {
    backgroundColor: "#ffff99", // Light yellow color
    color: "#000", // Black text
  },
};

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Typography
      variant="body1"
      color="inherit"
      onClick={() => loginWithRedirect()}
      style={{ cursor: "pointer" }}
    >
      Sign In
    </Typography>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Typography
      variant="body1"
      color="inherit"
      onClick={() => logout({ returnTo: window.location.origin })}
      style={{ cursor: "pointer" }}
    >
      Sign Out
    </Typography>
  );
};

const DashboardButton = () => {
  return (
    <Typography
      variant="body1"
      color="inherit"
      component={Link} // Use Link component
      to="/dashboard" // Specify the destination path
      style={{ cursor: "pointer", textDecoration: "none" }}
    >
      Dashboard
    </Typography>
  );
};

const UserEmail = () => {
  const { user, isAuthenticated } = useAuth0();

  return isAuthenticated && user.email ? (
    <Typography variant="body1" color="inherit">
      {user.email}
    </Typography>
  ) : null;
};

const Theme = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, logout } = useAuth0();
  const location = useLocation();
  const currentPath = location.pathname;

  const footerPosition = () => {
    return "relative";
  };

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("auth0.id_token");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          logout({ returnTo: window.location.origin });
        }
      }
    };

    checkTokenExpiration();
  }, [logout]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <AppBar position="fixed" style={styles.topAppBar}>
        <Toolbar>
          {currentPath === "/" && (
             <Box component={Link} to="/" >
          
                    <Avatar
                    alt="App Icon"
                    src="/apple-touch-icon.png"
                    sx={{ marginRight: '10px', width: 56, height: 56 }}
                    variant="square"
                  />
                          </Box>
          )}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            aria-controls="menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            style={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {isAuthenticated && currentPath !== "/dashboard" && (
              <MenuItem onClick={handleMenuClose}>
                <DashboardButton />
              </MenuItem>
            )}
            {isAuthenticated && (
              <MenuItem onClick={handleMenuClose}>
                <LogoutButton />
              </MenuItem>
            )}

            {!isAuthenticated && (
              <MenuItem onClick={handleMenuClose}>
                <LoginButton />
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {children}

      {currentPath === "/" && (
        <AppBar position={footerPosition()} style={styles.bottomAppBar}>
          <Toolbar>
            <Typography variant="h6" style={{ marginRight: "16px" }}>
              Contact:
            </Typography>
            <Typography variant="body1">popo24@gmail.com</Typography>
          </Toolbar>
        </AppBar>
      )}
    </div>
  );
};

export default Theme;
