import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import Payslip from '../components/Payslip';
import { API_URL } from '../config';

export default function SearchPayslip() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [payslipData, setPayslipData] = useState(null);
  const [searchStatus, setSearchStatus] = useState('');

  const formatDt = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getFullYear()).slice(-2)}`;
  };

  const handleSearch = async () => {
    if (!query) return;
    setSearchStatus('Searching...');
    setResults([]);
    setSelectedPayrollId(null);
    setPayslipData(null);
    
    try {
      const response = await axios.get(`${API_URL}/employee/search?q=${query}`);
      setResults(response.data);
      setSearchStatus(response.data.length > 0 ? '' : 'No matching records found.');
    } catch (error) {
      console.error(error);
      setSearchStatus('Search failed.');
    }
  };

  const handleGenerate = async (payrollId) => {
    setSelectedPayrollId(payrollId);
    try {
      const response = await axios.get(`${API_URL}/payslip/${payrollId}`);
      setPayslipData(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch payslip data");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }} className="hide-on-print">
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Search Payslip</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            fullWidth 
            label="Search by Pers No, PAN, or Name" 
            value={query} 
            onChange={(e) => setQuery(e.target.value.toUpperCase())} 
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch}>Search</Button>
        </Box>

        {searchStatus && <Typography color="text.secondary" sx={{ mt: 2 }}>{searchStatus}</Typography>}

        {results.length > 0 && (
          <List sx={{ mt: 2, border: '1px solid #eee', borderRadius: 1 }}>
            {results.map((emp) => (
              <ListItem key={emp.payroll_id} disablePadding>
                <ListItemButton onClick={() => handleGenerate(emp.payroll_id)} selected={selectedPayrollId === emp.payroll_id}>
                  <ListItemText 
                    primary={`${emp.name} (Pers: ${emp.pers_no})`} 
                    secondary={`PAN: ${emp.pan} | Period: ${formatDt(emp.pay_period_from)} to ${formatDt(emp.pay_period_to)}`} 
                  />
                  <Button variant="outlined" size="small">Generate</Button>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {payslipData && (
         <Box>
            <Payslip data={payslipData} />
         </Box>
      )}
    </Box>
  );
}
