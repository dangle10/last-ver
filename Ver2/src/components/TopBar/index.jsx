import React from "react";
import { AppBar, Toolbar, Typography, FormControlLabel, Checkbox } from "@mui/material";

import "./styles.css";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar({ context, advancedFeature, setAdvancedFeature }) {
  return (
    <AppBar className="topbar-appBar" position="static">
      <Toolbar className="topbar-toolbar">
        <Typography variant="h6" className="topbar-title">
          Le Hai Dang
        </Typography>
        <div className="topbar-right">
          <FormControlLabel
            control={
              <Checkbox
                checked={advancedFeature}
                onChange={(e) => setAdvancedFeature(e.target.checked)}
                className="topbar-checkbox"
              />
            }
            label="Advanced"
            className="topbar-label"
          />
          <Typography variant="body1" className="topbar-context">
            {context}
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
