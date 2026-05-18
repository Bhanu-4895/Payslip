import React, { useRef } from 'react';
import { Paper, Box, Typography, Grid, Button } from '@mui/material';
import html2pdf from 'html2pdf.js';
import Header from './Header';
import EmployeeDetails from './EmployeeDetails';
import DataTable from './DataTable';

export default function Payslip({ data }) {
  const payslipRef = useRef();

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = payslipRef.current;
    
    // Config for exact layout preservation
    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `Payslip_${data.employee.pers_no}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const { employee, payroll, earnings, taxes, deductions, totals } = data;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }} className="hide-on-print">
        <Button variant="outlined" color="primary" onClick={handlePrint}>Print</Button>
        <Button variant="contained" color="secondary" onClick={handleDownloadPdf}>Download PDF</Button>
      </Box>

      {/* Force a web-safe font like Arial to prevent html2canvas text overlapping bugs with custom web fonts */}
      <div ref={payslipRef} style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: 'normal', wordSpacing: 'normal' }}>
        <Paper elevation={0} sx={{ 
          width: '100%', 
          maxWidth: '850px', 
          margin: '0 auto', 
          p: 2, 
          backgroundColor: '#fff',
          color: '#000',
          border: '1px solid #ccc',
          fontFamily: 'Arial, Helvetica, sans-serif' 
        }}>
          <Header />
          <EmployeeDetails employee={employee} payroll={payroll} />

          <Box sx={{ mt: 1.5 }}>
            <DataTable 
              title="EARNINGS" 
              data={earnings} 
              totalLabel="Total Earnings"
              totalCurrent={totals.earnings}
              totalYtd={totals.ytdEarnings}
            />
            
            <Box sx={{ my: 1, height: '1px', backgroundColor: '#e0e0e0' }} />

            <DataTable 
              title="TAXES" 
              data={taxes} 
              totalLabel="Total Tax"
              totalCurrent={totals.tax}
              totalYtd={totals.ytdTax}
            />

            <Box sx={{ my: 1, height: '1px', backgroundColor: '#e0e0e0' }} />

            <DataTable 
              title="DEDUCTIONS" 
              data={deductions} 
              totalLabel="Total Deductions"
              totalCurrent={totals.deductions}
              totalYtd={totals.ytdDeductions}
            />
          </Box>

          {/* Formula Section */}
          <Box sx={{ mt: 2, py: 1, borderTop: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: 'normal', fontFamily: 'Arial, sans-serif' }}>
              NET PAY = TOTAL EARNINGS - TOTAL TAXES - TOTAL DEDUCTIONS
            </Typography>
          </Box>

          {/* Direct Deposit Section */}
          <Box sx={{ mt: 1.5, border: '1px solid #ccc', p: 1.5 }}>
            <Typography sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '11px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
              DIRECT DEPOSIT INFORMATION
            </Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
              <tbody>
                <tr>
                  <td style={{ width: '15%', padding: '2px 0', color: '#666' }}>Bank Name:</td>
                  <td style={{ width: '35%', padding: '2px 0', fontWeight: 'bold' }}>{employee.bank_name}</td>
                  <td style={{ width: '15%', padding: '2px 0', color: '#666' }}>Bank Account:</td>
                  <td style={{ width: '35%', padding: '2px 0', fontWeight: 'bold' }}>{employee.bank_account}</td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Paper>
      </div>
    </Box>
  );
}
