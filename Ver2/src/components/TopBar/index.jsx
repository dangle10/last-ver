import React, { useRef } from "react";
import { AppBar, Toolbar, Typography, FormControlLabel, Checkbox, Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; 

import "./styles.css";

function TopBar({ context, advancedFeature, setAdvancedFeature, loggedInUser, setLoggedInUser }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8081/admin/logout", {
        method: "POST",
        credentials: "include", 
      });

      if (response.ok) {
        setLoggedInUser(null); 
        navigate("/login-register"); 
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return; 

    const formData = new FormData();
    formData.append("uploadedphoto", file); 

    try {
      const response = await fetch("http://localhost:8081/photos/new", {
        method: "POST",
        body: formData,
        credentials: "include", 
      });

      if (response.ok) {
        navigate(`/photos/${loggedInUser._id}`);
      } else {
        console.error("Lỗi khi upload ảnh");
      }
    } catch (error) {
      console.error("Lỗi mạng khi upload ảnh:", error);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="static">
      <Toolbar className="topbar-toolbar" style={{ display: 'flex', justifyContent: 'space-between' }}>
        
        <Typography variant="h6" className="topbar-title">
         
          {loggedInUser ? `Hi ${loggedInUser.first_name}` : "Please Login"}
        </Typography>

        <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* ================= TẤT CẢ GÓI GỌN VÀO ĐÂY ================= */}
          {/* CHỈ HIỆN CỤM CHECKBOX, CONTEXT VÀ CÁC NÚT BẤM KHI ĐÃ ĐĂNG NHẬP */}
          {loggedInUser && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={advancedFeature}
                    onChange={(e) => setAdvancedFeature(e.target.checked)}
                    className="topbar-checkbox"
                    style={{ color: 'white' }} 
                  />
                }
                label="Advanced"
                className="topbar-label"
              />
              
              <Typography variant="body1" className="topbar-context">
                {context}
              </Typography>

              <input 
                type="file" 
                accept="image/*" 
                hidden 
                ref={fileInputRef}
                onChange={handleUpload}
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => fileInputRef.current.click()}
              >
                Add Photo
              </Button>

              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleLogout}
                size="small"
              >
                Logout
              </Button>
            </>
          )}
          {/* ============================================================ */}

        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;