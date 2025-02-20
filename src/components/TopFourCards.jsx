"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import Image from "next/image";

// Helper component for fade-in effect
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
        src={src}
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

const TopFourCards = () => {
  const [animeData, setAnimeData] = useState([]);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const res = await fetch("/api/trending-anime"); // Adjust endpoint if necessary
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
    <Grid container spacing={4} sx={{ padding: "20px" }}>
      {animeData.map((item) => {
        const { node } = item;
        return (
          <Grid item xs={12} sm={6} md={3} key={node.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Box sx={{ position: "relative", width: "100%", height: 180 }}>
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
              </Box>
              <CardContent>
                <Typography variant="h6" component="div" align="center">
                  {node.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TopFourCards;
