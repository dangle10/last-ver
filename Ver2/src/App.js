import './App.css';

import React, { useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"; // Import thêm Navigate

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister"; // Nhớ import component mới này nhé

const App = (props) => {
  const [advancedFeature, setAdvancedFeature] = useState(false);
  const [topBarContext, setTopBarContext] = useState("Home");
  
  // State quản lý phiên đăng nhập
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
      <Router>
        <div>
          {/* Truyền thêm loggedInUser và hàm setLoggedInUser xuống TopBar */}
          <TopBar 
            context={topBarContext} 
            advancedFeature={advancedFeature} 
            setAdvancedFeature={setAdvancedFeature} 
            loggedInUser={loggedInUser}
            setLoggedInUser={setLoggedInUser}
          />
          
          <Grid container spacing={2} style={{ padding: '16px', marginTop: 0 }}>
            <Grid item xs={12} sm={3}>
              <Paper className="main-grid-item">
                {/* Ẩn danh sách người dùng nếu chưa đăng nhập */}
                {loggedInUser ? (
                  <UserList />
                ) : (
                  <Typography variant="body1" style={{ padding: '16px' }}>
                    Vui lòng đăng nhập
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={9}>
              <Paper className="main-grid-item">
                <Routes>
                  {/* Route đăng nhập (Không cần bảo vệ) */}
                  <Route
                    path="/login-register"
                    element={<LoginRegister setLoggedInUser={setLoggedInUser} />}
                  />

                  {/* Các Route cần bảo vệ: Nếu có loggedInUser thì render, không thì Navigate về login */}
                  <Route
                      path="/users/:userId"
                      element={loggedInUser ? <UserDetail setTopBarContext={setTopBarContext} /> : <Navigate to="/login-register" replace />}
                  />
                  <Route
                      path="/photos/:userId"
                      element={loggedInUser ? <UserPhotos advancedFeature={advancedFeature} setTopBarContext={setTopBarContext} /> : <Navigate to="/login-register" replace />}
                  />
                  <Route
                      path="/photos/:userId/:photoId"
                      element={loggedInUser ? <UserPhotos advancedFeature={advancedFeature} setTopBarContext={setTopBarContext} /> : <Navigate to="/login-register" replace />}
                  />
                  <Route 
                      path="/users" 
                      element={loggedInUser ? <UserList /> : <Navigate to="/login-register" replace />} 
                  />
                  
                  {/* Route mặc định (Trang chủ) */}
                  <Route 
                      path="/" 
                      element={loggedInUser ? <Navigate to="/users" replace /> : <Navigate to="/login-register" replace />} 
                  />
                </Routes>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Router>
  );
}

export default App;