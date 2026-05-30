import React, { useState } from "react";
import { Typography, Button, TextField, Box, Paper, Grid, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

function LoginRegister({ setLoggedInUser }) {
  const navigate = useNavigate();

  // ----- STATE CHO FORM ĐĂNG NHẬP -----
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ----- STATE CHO FORM ĐĂNG KÝ -----
  const [regUser, setRegUser] = useState({
    login_name: "",
    password: "",
    passwordConfirm: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: ""
  });
  const [regMessage, setRegMessage] = useState({ text: "", type: "" }); // type: "error" hoặc "success"

  // ==========================================
  // XỬ LÝ ĐĂNG NHẬP
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Đã cập nhật: Gửi kèm mật khẩu lên server
        body: JSON.stringify({ login_name: loginName, password: loginPassword }),
        credentials: "include", 
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const user = await response.json();
      setLoggedInUser(user);
      navigate(`/users/${user._id}`);
    } catch (error) {
      setLoginError("Đăng nhập thất bại: " + error.message);
    }
  };

  // ==========================================
  // XỬ LÝ ĐĂNG KÝ
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Yêu cầu của thầy: 2 ô mật khẩu phải giống hệt nhau
    if (regUser.password !== regUser.passwordConfirm) {
      setRegMessage({ text: "Mật khẩu nhập lại không khớp!", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regUser),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      // Đăng ký thành công
      setRegMessage({ text: "Đăng ký thành công! Bạn có thể đăng nhập ngay bên trái.", type: "success" });
      
      // Xóa form đăng ký
      setRegUser({
        login_name: "", password: "", passwordConfirm: "", 
        first_name: "", last_name: "", location: "", description: "", occupation: ""
      });
      
    } catch (error) {
      setRegMessage({ text: "Lỗi đăng ký: " + error.message, type: "error" });
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ padding: 4, width: '100%', maxWidth: 900 }}>
        <Grid container spacing={4}>
          
          {/* ================= CỘT TRÁI: ĐĂNG NHẬP ================= */}
          <Grid item xs={12} md={5}>
            <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
              Đăng Nhập
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth label="Login Name" variant="outlined" margin="normal" required
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
              <TextField
                fullWidth label="Password" variant="outlined" margin="normal" required
                type="password" // Ẩn mật khẩu thành dấu chấm
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {loginError && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{loginError}</Typography>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5 }}>
                Login
              </Button>
            </form>
          </Grid>

          {/* ĐƯỜNG KẺ GIỮA */}
          <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Divider orientation="vertical" flexItem />
          </Grid>

          {/* ================= CỘT PHẢI: ĐĂNG KÝ ================= */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom color="secondary" fontWeight="bold">
              Đăng Ký Tài Khoản Mới
            </Typography>
            <form onSubmit={handleRegister}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Login Name *" variant="outlined" size="small" required
                    value={regUser.login_name} onChange={(e) => setRegUser({...regUser, login_name: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name *" variant="outlined" size="small" required
                    value={regUser.first_name} onChange={(e) => setRegUser({...regUser, first_name: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name *" variant="outlined" size="small" required
                    value={regUser.last_name} onChange={(e) => setRegUser({...regUser, last_name: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Password *" variant="outlined" size="small" type="password" required
                    value={regUser.password} onChange={(e) => setRegUser({...regUser, password: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Confirm Password *" variant="outlined" size="small" type="password" required
                    value={regUser.passwordConfirm} onChange={(e) => setRegUser({...regUser, passwordConfirm: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Location" variant="outlined" size="small"
                    value={regUser.location} onChange={(e) => setRegUser({...regUser, location: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Occupation" variant="outlined" size="small"
                    value={regUser.occupation} onChange={(e) => setRegUser({...regUser, occupation: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Description" variant="outlined" size="small" multiline rows={2}
                    value={regUser.description} onChange={(e) => setRegUser({...regUser, description: e.target.value})} />
                </Grid>
              </Grid>

              {regMessage.text && (
                <Typography color={regMessage.type === "error" ? "error" : "success.main"} variant="body2" sx={{ mt: 2 }}>
                  {regMessage.text}
                </Typography>
              )}

              <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2, py: 1.5 }}>
                Register Me
              </Button>
            </form>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  );
}

export default LoginRegister;