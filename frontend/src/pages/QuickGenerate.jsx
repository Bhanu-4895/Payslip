import React, { useState } from 'react';
import { Box, Paper, Grid, TextField, Typography, Button, Divider, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Payslip from '../components/Payslip';

const BANKS = ['SBI', 'ICICI', 'HDFC', 'AXIS', 'KOTAK'];

export default function QuickGenerate() {
  const [formData, setFormData] = useState({
    name: '', persNo: '', designation: '', pan: '', department: '', doj: '',
    payPeriodFrom: '', payPeriodTo: '', paidDays: '', grossBasicPay: '', basicPay: '', hra: '', transport: '', meal: '',
    pfNo: '', uan: '', incomeTax: '', pf: '', profTax: '', medInsurance: '', sodexo: '',
    bankName: '', bankAccount: ''
  });
  const [status, setStatus] = useState('');
  const [generatedData, setGeneratedData] = useState(null);

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
    let val = typeof value === 'string' ? value.toUpperCase() : value;

    if (name === 'pan') {
      val = val.replace(/[^A-Z0-9]/g, '');
      val = val.slice(0, 10);
    }

    let newForm = { ...formData, [name]: val };

    if (name === 'meal') {
      newForm.sodexo = val;
    }

    if (name === 'payPeriodFrom' && val) {
      const fromDate = new Date(val);
      if (!isNaN(fromDate)) {
        const lastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
        const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth()+1).padStart(2,'0')}-${String(lastDay.getDate()).padStart(2,'0')}`;
        newForm.payPeriodTo = lastDayStr;
      }
    }

    let paidDaysChanged = false;
    if ((name === 'payPeriodFrom' || name === 'payPeriodTo')) {
      const from = name === 'payPeriodFrom' ? val : newForm.payPeriodFrom;
      const to = name === 'payPeriodTo' ? val : newForm.payPeriodTo;
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
      const gbp = parseFloat(name === 'grossBasicPay' ? val : newForm.grossBasicPay) || 0;
      const pd = parseFloat(newForm.paidDays) || 0;
      const earnedBp = (gbp * pd / 30).toFixed(2);
      newForm.basicPay = earnedBp;
      
      newForm.hra = (earnedBp * 0.50).toFixed(2);
      newForm.pf = (earnedBp * 0.12).toFixed(2);
    }

    if (['basicPay', 'hra', 'transport', 'meal'].includes(name) || name === 'grossBasicPay' || paidDaysChanged) {
      const bp = parseFloat(newForm.basicPay) || 0;
      const hra = parseFloat(newForm.hra) || 0;
      const tp = parseFloat(name === 'transport' ? val : newForm.transport) || 0;
      const ml = parseFloat(name === 'meal' ? val : newForm.meal) || 0;
      const totalEarnings = bp + hra + tp + ml;
      newForm.incomeTax = calculateTax(totalEarnings).toFixed(2);
    }

    setFormData(newForm);
  };

  const isInvalid = (val, regex) => val && !new RegExp(regex).test(val);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final check for errors before generating
    const hasErrors = isInvalid(formData.name, "^[A-Za-z\\s]+$") ||
                      isInvalid(formData.persNo, "^[A-Za-z0-9]+$") ||
                      isInvalid(formData.designation, "^[A-Za-z\\s]+$") ||
                      isInvalid(formData.pan, "^[A-Za-z0-9]{10}$") ||
                      isInvalid(formData.department, "^[A-Za-z\\s]+$") ||
                      isInvalid(formData.pfNo, "^[A-Za-z0-9\\W_]+$") ||
                      isInvalid(formData.uan, "^[A-Za-z0-9]+$") ||
                      isInvalid(formData.bankAccount, "^[0-9]+$");

    if (hasErrors) {
      setStatus('Please fix the highlighted errors before generating.');
      return;
    }

    // Calculations
    const bp = parseFloat(formData.basicPay) || 0;
    const hra = parseFloat(formData.hra) || 0;
    const tp = parseFloat(formData.transport) || 0;
    const ml = parseFloat(formData.meal) || 0;
    const totalEarnings = bp + hra + tp + ml;

    const itax = parseFloat(formData.incomeTax) || 0;
    const totalTax = itax;

    const pfc = parseFloat(formData.pf) || 0;
    const ptax = parseFloat(formData.profTax) || 0;
    const mIns = parseFloat(formData.medInsurance) || 0;
    const sdx = parseFloat(formData.sodexo) || 0;
    const deductionsTotal = pfc + ptax + mIns + sdx;

    const netPay = totalEarnings - totalTax - deductionsTotal;

    const formatDt = (dt) => {
      if (!dt) return '';
      const d = new Date(dt);
      return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getFullYear()).slice(-2)}`;
    };

    const ytdMulti = 12;

    // Build the expected Payslip structure
    const payload = {
      employee: {
        name: formData.name,
        pers_no: formData.persNo,
        designation: formData.designation,
        pan: formData.pan,
        department: formData.department,
        doj: formData.doj,
        pf_no: formData.pfNo,
        uan: formData.uan,
        bank_name: formData.bankName,
        bank_account: formData.bankAccount
      },
      payroll: {
        payPeriod: `${formatDt(formData.payPeriodFrom)} to ${formatDt(formData.payPeriodTo)}`,
        paidDays: Number(formData.paidDays).toFixed(2),
        netPay: Number(netPay).toFixed(2),
        monthYear: formData.payPeriodFrom ? new Date(formData.payPeriodFrom).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : ''
      },
      earnings: [
        { label: "Gross Pay", current: bp.toFixed(2), ytd: (bp * ytdMulti).toFixed(2) },
        { label: "HRA", current: hra.toFixed(2), ytd: (hra * ytdMulti).toFixed(2) },
        { label: "Transport Allowance", current: tp.toFixed(2), ytd: (tp * ytdMulti).toFixed(2) },
        { label: "Meal Coupon", current: ml.toFixed(2), ytd: (ml * ytdMulti).toFixed(2) }
      ],
      taxes: [
        { label: "Income Tax", current: itax.toFixed(2), ytd: (itax * ytdMulti).toFixed(2) }
      ],
      deductions: [
        { label: "EE PF contribution", current: pfc.toFixed(2), ytd: (pfc * ytdMulti).toFixed(2) },
        { label: "Prof Tax - Full period", current: ptax.toFixed(2), ytd: (ptax * ytdMulti).toFixed(2) },
        { label: "Med. Insurance - Sr Citizen", current: mIns.toFixed(2), ytd: (mIns * ytdMulti).toFixed(2) },
        { label: "Sodexo Deduction", current: sdx.toFixed(2), ytd: (sdx * ytdMulti).toFixed(2) }
      ],
      totals: {
        earnings: totalEarnings.toFixed(2),
        ytdEarnings: (totalEarnings * ytdMulti).toFixed(2),
        tax: totalTax.toFixed(2),
        ytdTax: (totalTax * ytdMulti).toFixed(2),
        deductions: deductionsTotal.toFixed(2),
        ytdDeductions: (deductionsTotal * ytdMulti).toFixed(2)
      }
    };

    setGeneratedData(payload);
    setStatus('');
  };

  const gbp = parseFloat(formData.grossBasicPay) || 0;
  const bp = parseFloat(formData.basicPay) || 0;
  const hra = parseFloat(formData.hra) || 0;
  const tp = parseFloat(formData.transport) || 0;
  const ml = parseFloat(formData.meal) || 0;
  const totalEarnings = bp + hra + tp + ml;

  const itax = parseFloat(formData.incomeTax) || 0;
  const totalTax = itax;

  const pfc = parseFloat(formData.pf) || 0;
  const ptax = parseFloat(formData.profTax) || 0;
  const mIns = parseFloat(formData.medInsurance) || 0;
  const sdx = parseFloat(formData.sodexo) || 0;
  const deductionsTotal = pfc + ptax + mIns + sdx;

  const netPay = totalEarnings - totalTax - deductionsTotal;

  if (generatedData) {
    return (
      <Box sx={{ maxWidth: '850px', margin: '0 auto', p: 2 }}>
        <Box sx={{ mb: 3 }} className="hide-on-print">
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setGeneratedData(null)}>
            Back to Editor
          </Button>
        </Box>
        <Payslip data={generatedData} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
          QUICK PAYSLIP GENERATOR (ON-THE-FLY)
        </Typography>

        {status && (
          <Typography variant="subtitle1" align="center" color={status.includes('Successfully') ? 'success.main' : 'error.main'} sx={{ mb: 3, fontWeight: 'bold' }}>
            {status}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>EMPLOYEE DETAILS</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Employee Name" name="name" required value={formData.name} onChange={handleChange} 
                error={isInvalid(formData.name, "^[A-Za-z\\s]+$")}
                helperText={isInvalid(formData.name, "^[A-Za-z\\s]+$") ? "Only letters and spaces allowed" : ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Personal Number" name="persNo" required value={formData.persNo} onChange={handleChange} 
                error={isInvalid(formData.persNo, "^[A-Za-z0-9]+$")}
                helperText={isInvalid(formData.persNo, "^[A-Za-z0-9]+$") ? "Only alphanumeric characters allowed" : ""}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                fullWidth label="Designation" name="designation" required value={formData.designation} onChange={handleChange} 
                error={isInvalid(formData.designation, "^[A-Za-z\\s]+$")}
                helperText={isInvalid(formData.designation, "^[A-Za-z\\s]+$") ? "Only letters and spaces allowed" : ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="PAN" name="pan" required value={formData.pan} onChange={handleChange} inputProps={{ maxLength: 10 }} placeholder="ABCDE1234F"
                error={isInvalid(formData.pan, "^[A-Za-z0-9]{10}$")}
                helperText={isInvalid(formData.pan, "^[A-Za-z0-9]{10}$") ? "Must be exactly 10 alphanumeric characters" : ""}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField 
                fullWidth label="Department" name="department" required value={formData.department} onChange={handleChange} 
                error={isInvalid(formData.department, "^[A-Za-z\\s]+$")}
                helperText={isInvalid(formData.department, "^[A-Za-z\\s]+$") ? "Only letters and spaces allowed" : ""}
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

            <Grid item xs={4}>
              <TextField 
                fullWidth label="PF No" name="pfNo" required value={formData.pfNo} onChange={handleChange} 
                error={isInvalid(formData.pfNo, "^[A-Za-z0-9\\W_]+$")}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField 
                fullWidth label="UAN" name="uan" required value={formData.uan} onChange={handleChange} 
                error={isInvalid(formData.uan, "^[A-Za-z0-9]+$")}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField 
                fullWidth label="Basic Pay" name="grossBasicPay" type="number" inputProps={{ step: "0.01" }} required value={formData.grossBasicPay} onChange={handleChange} onBlur={handleFormatDecimal} 
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>EARNINGS</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="Gross Pay" name="basicPay" type="number" value={formData.basicPay} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Gross Pay (YTD)" value={(bp * 12).toFixed(2)} disabled />
            </Grid>

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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Total Taxes: {totalTax.toFixed(2)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>DEDUCTIONS</Typography>
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField fullWidth label="EE PF contribution (Auto Calculated)" name="pf" type="number" value={formData.pf} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="EE PF contribution (YTD)" value={(pfc * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Professional Tax" name="profTax" type="number" inputProps={{ step: "0.01" }} required value={formData.profTax} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Professional Tax (YTD)" value={(ptax * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Med. Insurance" name="medInsurance" type="number" inputProps={{ step: "0.01" }} required value={formData.medInsurance} onChange={handleChange} onBlur={handleFormatDecimal} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Med. Insurance (YTD)" value={(mIns * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Sodexo Deduction (Synced to Meal)" name="sodexo" type="number" value={formData.sodexo} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Sodexo Deduction (YTD)" value={(sdx * 12).toFixed(2)} disabled />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Total Deductions: {deductionsTotal.toFixed(2)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: 'primary.main' }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>Direct Deposit Information</Typography>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <TextField fullWidth select label="Bank Name" name="bankName" required value={formData.bankName} onChange={handleChange}>
                {BANKS.map((b) => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Bank Account Number" name="bankAccount" required value={formData.bankAccount} onChange={handleChange}
                error={isInvalid(formData.bankAccount, "^[0-9]+$")}
                helperText={isInvalid(formData.bankAccount, "^[0-9]+$") ? "Only numbers allowed" : ""}
              />
            </Grid>
          </Grid>

          <Box sx={{ border: '2px solid #1a365d', p: 2, borderRadius: 1, mb: 4, textAlign: 'center', backgroundColor: '#f0f4f8' }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              NET PAY PROJECTION: {netPay.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="primary" size="large" type="submit" sx={{ minWidth: 200, py: 1.5 }}>
              Generate Payslip
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
