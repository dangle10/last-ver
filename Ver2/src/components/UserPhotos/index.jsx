import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Divider,
  Button,
  TextField, // Import thêm TextField
} from "@mui/material";
import { useParams, Link, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos({ advancedFeature, setTopBarContext }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State mới: Lưu trữ nội dung bình luận đang gõ cho từng bức ảnh
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchModel(`http://localhost:8081/user/${userId}`), // Thêm http://localhost:8081 nếu fetchModel của bạn chưa cấu hình base URL
      fetchModel(`http://localhost:8081/photosOfUser/${userId}`),
    ])
      .then(([userRes, photosRes]) => {
        if (isMounted) {
          setUser(userRes.data);
          setPhotos(photosRes.data);
          if (setTopBarContext) {
            setTopBarContext(
              `Photos of ${userRes.data.first_name} ${userRes.data.last_name}`,
            );
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching user photos view data:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, setTopBarContext]);

  // Hàm xử lý thay đổi chữ trong ô nhập liệu
  const handleCommentChange = (photoId, text) => {
    setNewComments((prev) => ({ ...prev, [photoId]: text }));
  };

  // Hàm xử lý gửi bình luận lên Server
  const handleAddComment = async (photoId) => {
    const text = newComments[photoId];
    if (!text || text.trim() === "") return;

    try {
      const response = await fetch(`http://localhost:8081/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
        credentials: "include", // Phải có để gửi kèm session (nhận diện user)
      });

      if (response.ok) {
        // 1. Xóa trắng ô nhập liệu của ảnh đó
        setNewComments((prev) => ({ ...prev, [photoId]: "" }));
        
        // 2. Tải lại dữ liệu ảnh để bình luận mới hiện ra ngay lập tức
        const photosRes = await fetchModel(`http://localhost:8081/photosOfUser/${userId}`);
        setPhotos(photosRes.data);
      } else {
        console.error("Lỗi khi đăng bình luận");
      }
    } catch (error) {
      console.error("Lỗi mạng khi đăng bình luận:", error);
    }
  };

  if (loading || !user) {
    return <Typography>Loading photos...</Typography>;
  }

  if (photos.length === 0) {
    return <Typography>No photos found for this user.</Typography>;
  }

  const currentIndex = photoId ? photos.findIndex((p) => p._id === photoId) : 0;
  const currentPhoto = photos[currentIndex !== -1 ? currentIndex : 0];

  const goNext = () => {
    if (currentIndex < photos.length - 1) {
      navigate(`/photos/${userId}/${photos[currentIndex + 1]._id}`);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      navigate(`/photos/${userId}/${photos[currentIndex - 1]._id}`);
    }
  };

  const renderPhoto = (photo) => (
    <Card variant="outlined" key={photo._id} style={{ marginBottom: "20px" }}>
      <CardHeader
        title={new Date(photo.date_time).toLocaleString()}
        subheader={`By ${user.first_name} ${user.last_name}`}
      />
      <CardMedia
        component="img"
        image={`http://localhost:8081/images/${photo.file_name}`}
        alt={photo.file_name}
      />
      <CardContent>
        <Typography variant="h6">Comments:</Typography>
        <Divider style={{ margin: "10px 0" }} />
        {photo.comments && photo.comments.length > 0 ? (
          photo.comments.map((c) => (
            <div key={c._id} style={{ marginBottom: "10px" }}>
              <Typography variant="body2" color="textSecondary">
                {new Date(c.date_time).toLocaleString()} -{" "}
                <Link to={`/users/${c.user._id}`}>
                  {c.user.first_name} {c.user.last_name}
                </Link>
              </Typography>
              <Typography variant="body1">{c.comment}</Typography>
            </div>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No comments yet.
          </Typography>
        )}

        {/* ---------------- THÊM KHU VỰC NHẬP BÌNH LUẬN ---------------- */}
        <Divider style={{ margin: "15px 0" }} />
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <TextField
            size="small"
            fullWidth
            variant="outlined"
            placeholder="Viết bình luận..."
            value={newComments[photo._id] || ""}
            onChange={(e) => handleCommentChange(photo._id, e.target.value)}
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddComment(photo._id)}
            disabled={!newComments[photo._id] || newComments[photo._id].trim() === ""}
            style={{ marginTop: "2px" }}
          >
            Đăng
          </Button>
        </div>
        {/* ------------------------------------------------------------- */}

      </CardContent>
    </Card>
  );

  return (
    <div>
      {advancedFeature ? (
        <>
          {renderPhoto(currentPhoto)}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <Button
              variant="contained"
              disabled={currentIndex === 0}
              onClick={goPrev}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              disabled={currentIndex === photos.length - 1}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        photos.map((p) => renderPhoto(p))
      )}
    </div>
  );
}

export default UserPhotos;