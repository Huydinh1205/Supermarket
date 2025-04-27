import React from "react";
import { Link, Typography } from "@mui/material";

function MainFooter() {
  return (
    <Typography variant="body2" color="text.secondary" align="center" p={1}>
      {"Welcome"}
      <Link
        color="inherit"
        href="https://www.facebook.com/truong.cuong.478451?locale=vi_VN"
      >
        Store
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default MainFooter;
