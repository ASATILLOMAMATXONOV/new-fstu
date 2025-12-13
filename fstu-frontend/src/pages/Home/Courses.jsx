import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { users } from "./data";

export default function Courses() {
  const [filter, setFilter] = useState("all");

  const filteredUsers =
    filter === "all"
      ? users
      : users.filter((u) => u.type === filter);

  return (
    <Box>

      {/* ===== Banner ===== */}
      <Box
        sx={{
          height: 260,
          background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h3">Courses Page</Typography>
        <Typography>Home → Courses</Typography>
      </Box>

      {/* ===== Select ===== */}
      <Box sx={{ p: 3, maxWidth: 300 }}>
        <Select
          fullWidth
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="all">Barchasi</MenuItem>
          <MenuItem value="teacher">O‘qituvchilar</MenuItem>
          <MenuItem value="mentor">Mentorlar</MenuItem>
        </Select>
      </Box>

      {/* ===== Grid Cards ===== */}
      <Grid container spacing={3} sx={{ p: 3 }}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card sx={{ height: "100%" }}>
              <CardMedia
                component="img"
                height="200"
                image={user.img}
                alt={user.name}
              />
              <CardContent>
                <Typography variant="h6">{user.name}</Typography>
                <Typography color="text.secondary">
                  {user.role}
                </Typography>
                <Typography variant="body2">
                  📧 {user.email}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {user.description}
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  href="#"
                >
                  Batafsil
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ===== Buttonli menyular ===== */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mb: 4 }}
      >
        <Button variant="outlined">Biz haqimizda</Button>
        <Button variant="outlined">Kurslar</Button>
        <Button variant="outlined">Aloqa</Button>
      </Stack>

    </Box>
  );
}
