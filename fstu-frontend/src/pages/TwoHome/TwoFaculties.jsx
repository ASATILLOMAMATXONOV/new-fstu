import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Code2,
  Zap,
  Settings,
  ArrowRight,
  Layers,
} from "lucide-react";
import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";

const TwoFaculties = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const accentColor = theme.palette.primary.main;

  const faculties = [
    {
      id: 1,
      title: "Kompyuter tizimlari",
      icon: <Code2 size={24} />,
      desc: "Dasturiy taʼminot, sunʼiy intellekt va algoritmlar olami.",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000",
    },
    {
      id: 2,
      title: "Kiberxavfsizlik",
      icon: <ShieldCheck size={24} />,
      desc: "Axborot xavfsizligi va kriptografiya asoslari.",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000",
    },
    {
      id: 3,
      title: "Energetika",
      icon: <Zap size={24} />,
      desc: "Muqobil energiya va elektr injiniringi.",
      image:
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000",
    },
    {
      id: 4,
      title: "Mashinasozlik",
      icon: <Settings size={24} />,
      desc: "Robototexnika va avtomatlashtirilgan ishlab chiqarish.",
      image:
        "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=1000",
    },
  ];

  const [activeTab, setActiveTab] = useState(faculties[0]);

  return (
    <>
    <ColorModeProvider>
      <TwoNavbar />

      <div
        style={{
          backgroundColor: theme.palette.background.default,
          padding: "80px 20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: "1200px", width: "100%" }}>
          <div
            style={{
              display: "flex",
              height: "600px",
              backgroundColor: theme.palette.background.paper,
              borderRadius: "28px",
              overflow: "hidden",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* LEFT SIDE */}
            <div style={{ width: "65%", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${activeTab.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isDark
                    ? "linear-gradient(to right,#0d0d0d 35%,rgba(0,0,0,0.2))"
                    : "linear-gradient(to right,#ffffff 35%,rgba(255,255,255,0.4))",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  padding: "60px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    backgroundColor: accentColor,
                    color: "#fff",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 700,
                    width: "fit-content",
                  }}
                >
                  Fakultet yo'nalishi
                </span>

                <h2
                  style={{
                    color: theme.palette.text.primary,
                    fontSize: "48px",
                    fontWeight: 900,
                    margin: "24px 0 18px",
                  }}
                >
                  {activeTab.title}
                </h2>

                <p
                  style={{
                    color: theme.palette.text.secondary,
                    fontSize: "18px",
                    maxWidth: "520px",
                    lineHeight: 1.6,
                  }}
                >
                  {activeTab.desc}
                </p>

                <button
                  onClick={() => navigate(`/faculties/${activeTab.id}`)}
                  style={{
                    marginTop: "34px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    padding: "16px 36px",
                    borderRadius: "14px",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "fit-content",
                  }}
                >
                  Batafsil <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div
              style={{
                width: "35%",
                backgroundColor: theme.palette.background.paper,
                borderLeft: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "28px 30px",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Layers size={20} color={accentColor} />
                <span
                  style={{
                    color: theme.palette.text.primary,
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "1px",
                  }}
                >
                  FAKULTETLAR
                </span>
              </div>

              {faculties.map((fac) => {
                const active = activeTab.id === fac.id;

                return (
                  <button
                    key={fac.id}
                    onClick={() => setActiveTab(fac)}
                    style={{
                      padding: "22px 30px",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "18px",
                      background: active
                        ? theme.palette.action.hover
                        : "transparent",
                      borderLeft: `4px solid ${
                        active ? accentColor : "transparent"
                      }`,
                    }}
                  >
                    <span
                      style={{
                        color: active
                          ? accentColor
                          : theme.palette.text.secondary,
                      }}
                    >
                      {fac.icon}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: active
                          ? theme.palette.text.primary
                          : theme.palette.text.secondary,
                      }}
                    >
                      {fac.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </ColorModeProvider>
    </>
  );
};

export default TwoFaculties;
