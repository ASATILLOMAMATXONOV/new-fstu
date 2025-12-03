import { Box, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useState } from "react";

export default function HeroVideo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 260, md: 420 },
          backgroundImage:
            "url('https://static.akadem.uz/crop/1/2/1100__95_1213194640.jpg?t=1626442421')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
          }}
        />

        {/* Play */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              width: 90,
              height: 90,
              bgcolor: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.15)",
                bgcolor: "#f5f5f5",
              },
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 46, color: "#1f3c88" }} />
          </IconButton>
        </Box>
      </Box>

      {/* VIDEO MODAL */}
      {open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: "90%",
              maxWidth: 900,
              aspectRatio: "16/9",
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/3J92WpCAaNs?autoplay=1"
              title="YouTube video"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </Box>
        </Box>
      )}
    </>
  );
}
