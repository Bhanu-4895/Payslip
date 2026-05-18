import React from 'react';
import { Box, Typography } from '@mui/material';

export default function DataTable({ title, data, totalLabel, totalCurrent, totalYtd }) {
  if (!data) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {title && (
        <Typography sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '11px', textTransform: 'uppercase' }}>
          {title}
        </Typography>
      )}
      
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left', paddingBottom: '4px', fontWeight: 'normal', color: '#666' }}></th>
            <th style={{ textAlign: 'right', paddingBottom: '4px', fontWeight: 'normal', color: '#666' }}>
              <div>Current Period</div>
              <div>Amount</div>
            </th>
            <th style={{ textAlign: 'right', paddingBottom: '4px', fontWeight: 'normal', color: '#666' }}>
              <div>Year to Date</div>
              <div>Amount</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'left', padding: '2px 0', width: '50%' }}>{row.label}</td>
              <td style={{ textAlign: 'right', padding: '2px 0', width: '25%' }}>{row.current}</td>
              <td style={{ textAlign: 'right', padding: '2px 0', width: '25%' }}>{row.ytd}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '1px solid #ccc' }}>
            <td style={{ textAlign: 'left', padding: '4px 0', fontWeight: 'bold' }}>{totalLabel}</td>
            <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>{totalCurrent}</td>
            <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>{totalYtd}</td>
          </tr>
        </tfoot>
      </table>
    </Box>
  );
}
