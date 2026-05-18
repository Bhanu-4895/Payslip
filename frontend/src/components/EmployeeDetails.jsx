import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmployeeDetails({ employee, payroll }) {
  if (!employee || !payroll) return null;

  // Format DOJ (e.g. from 2026-05-06T18:30:00.000Z to DD-MM-YYYY)
  let formattedDoj = employee.doj;
  try {
    const d = new Date(employee.doj);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      formattedDoj = `${day}.${month}.${year}`;
    }
  } catch(e) {}

  return (
    <Box sx={{ border: '1px solid #ccc', p: 1.5, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold', color: '#555', fontSize: '11px' }}>Employee Name:</Typography>
          <Typography sx={{ fontSize: '11px' }}>{employee.name}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold', color: '#555', fontSize: '11px' }}>Personnel Number:</Typography>
          <Typography sx={{ fontSize: '11px' }}>{employee.pers_no}</Typography>
        </Box>
      </Box>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%', padding: '2px 0', fontWeight: 'bold', color: '#555' }}>Designation</td>
            <td style={{ width: '70%', padding: '2px 0' }}>{employee.designation}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>PAN</td>
            <td style={{ padding: '2px 0' }}>{employee.pan}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>Department</td>
            <td style={{ padding: '2px 0' }}>{employee.department}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>Date of Joining</td>
            <td style={{ padding: '2px 0' }}>{formattedDoj}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>Pay Period</td>
            <td style={{ padding: '2px 0' }}>{payroll.payPeriod}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>Paid Days</td>
            <td style={{ padding: '2px 0' }}>{payroll.paidDays}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>PF No</td>
            <td style={{ padding: '2px 0' }}>{employee.pf_no}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 0', fontWeight: 'bold', color: '#555' }}>UAN</td>
            <td style={{ padding: '2px 0' }}>{employee.uan}</td>
          </tr>
        </tbody>
      </table>
    </Box>
  );
}
