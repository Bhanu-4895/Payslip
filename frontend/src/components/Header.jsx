import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../assets/logo.jpeg';

export default function Header() {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ mr: 2 }}>
          <img src={logo} alt="Company Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
            NR SOFTECH (I) PVT.LTD.
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Plot No. 142, GR Reddy Nagar, Jammigadda, Secunderabad, Telangana, India - 500062
          </Typography>
        </Box>
      </Box>
      <Box sx={{ width: '100%', height: '2px', backgroundColor: '#000', mb: 1.5 }} />
    </Box>
  );
}
