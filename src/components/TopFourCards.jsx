"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Grid, Box, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { keyframes } from "@emotion/react";

// Helper component for fade-in effect on images
const FadeInImage = ({ src, alt, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        opacity: loaded ? 1 : 0,
        transition: "opacity 1s ease-in",
      }}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        onLoad={() => setLoaded(true)}
        style={{
          objectFit: "cover",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
        }}
        {...rest}
      />
    </Box>
  );
};

// Keyframes for title fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const lineAnimation = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const TopFourCards = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [animeData, setAnimeData] = useState([]);

  // Calculate current year and season
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // January is 0
  let season = "";
  if (month >= 0 && month <= 2) {
    season = "winter";
  } else if (month >= 3 && month <= 5) {
    season = "spring";
  } else if (month >= 6 && month <= 8) {
    season = "summer";
  } else {
    season = "fall";
  }

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const res = await fetch("/api/trending-anime", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch anime data");
        const json = await res.json();
        // Extract the top four results
        const topFour = json.data.slice(0, 4);
        setAnimeData(topFour);
      } catch (error) {
        console.error("Error fetching anime data:", error);
      }
    };

    fetchAnimeData();
  }, []);

  return (
    <Box sx={{ 
      padding: {
        xs: 2,  // 16px on mobile
        sm: 4,  // 32px on tablet
        md: 8,  // 64px on desktop
        lg: 15  // Original 120px on large screens
      }
    }}>
      {/* Title */}
      <Typography
        variant={isMobile ? "h4" : "h3"}
        component="h1"
        sx={{
          animation: `${fadeIn} 2s ease-in-out forwards`,
          background: "linear-gradient(90deg, red, pink, blue)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textAlign: "center",
          mb: 1,
          fontSize: {
            xs: '1.75rem',
            sm: '2.5rem',
            md: '3rem'
          }
        }}
      >
        Seasonal Anime - {season} {year}
      </Typography>
      {/* Animated red line under title */}
      <Box sx={{ 
        width: {
          xs: '90%',
          sm: '80%',
          md: '700px'
        }, 
        height: "4px", 
        overflow: "hidden", 
        mb: {
          xs: 8,
          sm: 15,
          md: 25
        }, 
        mx: "auto" 
      }}>
        <Box
          sx={{
            height: "100%",
            backgroundColor: "#f44336", // a nice red shade; adjust as needed
            width: 0,
            animation: `${lineAnimation} 2s ease forwards`,
          }}
        />
      </Box>

      {/* Anime Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {animeData.map((item) => {
          const { node } = item;
          return (
            <Grid item xs={6} sm={6} md={3} key={node.id}>
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  boxShadow: 3,
                  overflow: "hidden",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <Box sx={{ 
                  position: "relative", 
                  width: "100%", 
                  height: {
                    xs: 180,
                    sm: 220,
                    md: 300
                  }
                }}>
                  <FadeInImage
                    src={
                      node.main_picture?.large ||
                      node.main_picture?.medium ||
                      "/fallback-image.jpg"
                    }
                    alt={node.title}
                    sizes="(max-width: 600px) 100vw, 300px"
                    priority={true}
                  />
                  {/* Overlay title */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      padding: "4px 8px",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: "#fff", 
                        fontSize: {
                          xs: '0.75rem',
                          sm: '0.875rem',
                          md: '1rem'
                        },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {node.title}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TopFourCards;