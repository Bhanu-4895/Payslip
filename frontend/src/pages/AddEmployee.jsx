import React, { useState, useEffect } from 'react';
import { Box, Paper, Grid, TextField, Typography, Button, Divider, MenuItem } from '@mui/material';
import axios from 'axios';

const BANKS = ['SBI', 'ICICI', 'HDFC', 'AXIS', 'KOTAK'];

export default function AddEmployee() {
  const [formData, setFormData] = useState({
    name: '', persNo: '', designation: '', pan: '', department: '', doj: '',
    payPeriodFrom: '', payPeriodTo: '', paidDays: '', grossBasicPay: '', basicPay: '', hra: '', transport: '', meal: '',
    pfNo: '', uan: '', incomeTax: '', pf: '', profTax: '', medInsurance: '', sodexo: '',
    bankName: '', bankAccount: ''
  });
  const [status, setStatus] = useState('');

  const calculateTax = (monthlyEarnings) => {
    const annual = monthlyEarnings * 12;
    if (annual <= 700000) return 0;
    let tax = 0;
    if (annual > 1500000) tax += (annual - 1500000) * 0.30 + 150000;
    else if (annual > 1200000) tax += (annual - 1200000) * 0.20 + 90000;
    else if (annual > 900000) tax += (annual - 900000) * 0.15 + 45000;
    else if (annual > 600000) tax += (annual - 600000) * 0.10 + 15000;
    else if (annual > 300000) tax += (annual - 300000) * 0.05;
    return tax / 12;
  };

  const handleFormatDecimal = (e) => {
    const { name, value } = e.target;
    if (value && !isNaN(value)) {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value).toFixed(2) }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = name === 'pan' ? value.toUpperCase() : value;
    let newForm = { ...formData, [name]: val };

    let paidDaysChanged = false;
    if ((name === 'payPeriodFrom' || name === 'payPeriodTo')) {
      const from = name === 'payPeriodFrom' ? value : newForm.payPeriodFrom;
      const to = name === 'payPeriodTo' ? value : newForm.payPeriodTo;
      if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (!isNaN(fromDate) && !isNaN(toDate) && toDate >= fromDate) {
          const diffTime = Math.abs(toDate - fromDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
          newForm.paidDays = diffDays.toFixed(2);
          paidDaysChanged = true;
        }
      }
    }

    if (name === 'paidDays') {
      paidDaysChanged = true;
    }

    if (name === 'grossBasicPay' || paidDaysChanged) {
      const gbp = parseFloat(name === 'grossBasicPay' ? value : newForm.grossBasicPay) || 0;
      const pd = parseFloat(newForm.paidDays) || 0;
      const earnedBp = (gbp * pd / 30).toFixed(2);
      newForm.basicPay = earnedBp;
      
      newForm.hra = (earnedBp * 0.50).toFixed(2);
      newForm.pf = (earnedBp * 0.12).toFixed(2);
    }

    if (['basicPay', 'hra', 'transport', 'meal'].includes(name) || name === 'grossBasicPay' || paidDaysChanged) {
      const bp = parseFloat(newForm.basicPay) || 0;
      const hra = parseFloat(newForm.hra) || 0;
      const tp = parseFloat(name === 'transport' ? value : newForm.transport) || 0;
      const ml = parseFloat(name === 'meal' ? value : newForm.meal) || 0;
      const totalEarnings = bp + hra + tp + ml;
      newForm.incomeTax = calculateTax(totalEarnings).toFixed(2);
    }

    setFormData(newForm);
  };

  const isInvalid = (val, regex) => val && !new RegExp(regex).test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final check for errors before submitting
    const hasErrors = isInvalid(formData.name, "^[A-Za-z\\s]+$") ||
                      isInvalid(formData.persNo, "^[A-Za-z0-9]+$") ||
                      isInvalid(formData.designation, "^[A-Za-z\\s]+$") ||
                      isInvalid(formData.pan, "^[A-Za-z0-9]{10}$") ||
                      isInvalid(formData.department, "^[A-Za-z\\s]+$") ||
                      isInvalid(formData.pfNo, "^[A-Za-z0-9\\W_]+$") ||
                      isInvalid(formData.uan, "^[A-Za-z0-9]+$") ||
                      isInvalid(formData.bankAccount, "^[0-9]+$");

    if (hasErrors) {
      setStatus('Please fix the highlighted errors before saving.');
      return;
    }

    setStatus('Saving...');
    try {
      const payload = { ...formData };

      await axios.post('http://localhost:3001/employee', payload);
      setStatus('Successfully saved Employee and Payroll record!');
      setFormData({
        name: '', persNo: '', designation: '', pan: '', department: '', doj: '',
        payPeriodFrom: '', payPeriodTo: '', paidDays: '', grossBasicPay: '', basicPay: '', hra: '', transport: '', meal: '',
        pfNo: '', uan: '', incomeTax: '', pf: '', profTax: '', medInsurance: '', sodexo: '',
        bankName: '', bankAccount: ''
      });
    } catch (error) {
      console.error(error);
      setStatus('Failed to save. Please ensure backend is running.');
    }
  };

  const gbp = parseFloat(formData.grossBasicPay) || 0;
  const bp = parseFloat(formData.basicPay) || 0;
  const hra = parseFloat(formData.hra) || 0;
  const tp = parseFloat(formData.transport) || 0;
  const ml = parseFloat(formData.meal) || 0;
  const totalEarnings = bp + hra + tp + ml;

  const itax = parseFloat(formData.incomeTax) || 0;
  const totalTax = itax;

  const pf = parseFloat(formData.pf) || 0;
  const ptax = parseFloat(formData.profTax) || 0;
  const mIns = parseFloat(formData.medInsurance) || 0;
  const sodexo = parseFloat(formData.sodexo) || 0;
  const totalDeductions = pf + ptax + mIns + sodexo;

  const netPay = totalEarnings - totalTax - totalDeductions;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
           <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', flexGrow: 1 }}>Add Employee & Payroll</Typography>
        </Box>
        
        {status && (
           <Typography sx={{ mb: 2, color: status.includes('Success') ? 'green' : 'red', fontWeight: 'bold' }}>
             {status}
           </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Name" name="name" required value={formData.name} onChange={handleChange} 
                error={isInvalid(formData.name, "^[A-Za-z\\s]+$")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Pers. No" name="persNo" required value={formData.persNo} onChange={handleChange} placeholder="EMP1000"
                error={isInvalid(formData.persNo, "^[A-Za-z0-9]+$")}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                fullWidth label="Designation" name="designation" required value={formData.designation} onChange={handleChange} 
                error={isInvalid(formData.designation, "^[A-Za-z\\s]+$")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="PAN" name="pan" required value={formData.pan} onChange={handleChange} inputProps={{ maxLength: 10 }} placeholder="ABCDE1234F"
                error={isInvalid(formData.pan, "^[A-Za-z0-9]{10}$")}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                fullWidth label="Department" name="department" required value={formData.department} onChange={handleChange} 
                error={isInvalid(formData.department, "^[A-Za-z\\s]+$")}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Date of Joining (DOJ) *</Typography>
              <TextField fullWidth name="doj" type="date" required value={formData.doj} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Pay Period From *</Typography>
              <TextField fullWidth name="payPeriodFrom" type="date" required value={formData.payPeriodFrom} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Pay Period To *</Typography>
              <TextField fullWidth name="payPeriodTo" type="date" required value={formData.payPeriodTo} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Paid Days" name="paidDays" type="number" inputProps={{ step: "0.01" }} required value={formData.paidDays} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                fullWidth label="PF No" name="pfNo" required value={formData.pfNo} onChange={handleChange} 
                error={isInvalid(formData.pfNo, "^[A-Za-z0-9\\W_]+$")}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="UAN" name="uan" required value={formData.uan} onChange={handleChange} 
                error={isInvalid(formData.uan, "^[A-Za-z0-9]+$")}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>EARNINGS</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Gross Basic Pay (Monthly)" name="grossBasicPay" type="number" inputProps={{ step: "0.01" }} required value={formData.grossBasicPay} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Gross Basic Pay (YTD)" value={(gbp * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Earned Basic Pay (Prorated)" name="basicPay" type="number" value={formData.basicPay} disabled />
            </Grid>
            <Grid item xs={6}></Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="H.R.A. (Auto Calculated)" name="hra" type="number" value={formData.hra} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="H.R.A. (YTD)" value={(hra * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Transport Allowance" name="transport" type="number" inputProps={{ step: "0.01" }} required value={formData.transport} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Transport Allowance (YTD)" value={(tp * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Meal Coupon" name="meal" type="number" inputProps={{ step: "0.01" }} required value={formData.meal} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Meal Coupon (YTD)" value={(ml * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Total Earnings: {totalEarnings.toFixed(2)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>TAXES</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Income Tax" name="incomeTax" type="number" inputProps={{ step: "0.01" }} required value={formData.incomeTax} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Income Tax (YTD)" value={(itax * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Total Tax: {totalTax.toFixed(2)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>DEDUCTIONS</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Ee PF contribution (Auto)" name="pf" type="number" value={formData.pf} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Ee PF contribution (YTD)" value={(pf * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Prof Tax - Full Period" name="profTax" type="number" inputProps={{ step: "0.01" }} required value={formData.profTax} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Prof Tax (YTD)" value={(ptax * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Med. Insurance - Sr. Citizen" name="medInsurance" type="number" inputProps={{ step: "0.01" }} required value={formData.medInsurance} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Med. Insurance (YTD)" value={(mIns * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Sodexo Deduction" name="sodexo" type="number" inputProps={{ step: "0.01" }} required value={formData.sodexo} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Sodexo Deduction (YTD)" value={(sodexo * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Total Deductions: {totalDeductions.toFixed(2)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>DIRECT DEPOSIT INFORMATION</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField select fullWidth label="Bank Name" name="bankName" required value={formData.bankName} onChange={handleChange}>
                {BANKS.map((bank) => (
                  <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Bank Account" name="bankAccount" required value={formData.bankAccount} onChange={handleChange} 
                error={isInvalid(formData.bankAccount, "^[0-9]+$")}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>FORMULA</Typography>
          <Box sx={{ p: 2, backgroundColor: 'primary.light', color: '#fff', borderRadius: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', wordSpacing: 5 }}>
              NET PAY &nbsp;&nbsp;=&nbsp;&nbsp; TOTAL EARNINGS &nbsp;&nbsp;-&nbsp;&nbsp; TOTAL TAXES &nbsp;&nbsp;-&nbsp;&nbsp; TOTAL DEDUCTIONS
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
              {netPay.toFixed(2)} &nbsp;&nbsp;=&nbsp;&nbsp; {totalEarnings.toFixed(2)} &nbsp;&nbsp;-&nbsp;&nbsp; {totalTax.toFixed(2)} &nbsp;&nbsp;-&nbsp;&nbsp; {totalDeductions.toFixed(2)}
            </Typography>
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
            Save Employee & Payroll
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
