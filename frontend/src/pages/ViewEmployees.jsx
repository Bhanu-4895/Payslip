import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CardActions, Button, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function ViewEmployees() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee? This will also delete their payroll records.")) {
      try {
        await axios.delete(`${API_URL}/employees/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (error) {
        console.error('Failed to delete employee', error);
        alert('Failed to delete employee.');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Employee Directory
      </Typography>

      <Grid container spacing={3}>
        {employees.map(emp => (
          <Grid item xs={12} sm={6} md={4} key={emp.id}>
            <Card elevation={3} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{emp.name}</Typography>
                <Typography color="text.secondary" gutterBottom>{emp.designation}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={`Pers No: ${emp.pers_no}`} size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label={`Dept: ${emp.department}`} size="small" variant="outlined" sx={{ mb: 1 }} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>DOJ:</strong> {new Date(emp.doj).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>PAN:</strong> {emp.pan}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2, borderTop: '1px solid #f0f0f0' }}>
                <IconButton color="primary" onClick={() => navigate(`/edit/${emp.id}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(emp.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {employees.length === 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
          No employees found.
        </Typography>
      )}
    </Box>
  );
}
