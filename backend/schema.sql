-- Drop tables if they exist
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS employee;

-- Employee Table
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pers_no VARCHAR(100) UNIQUE NOT NULL,
    pan VARCHAR(20) NOT NULL,
    uan VARCHAR(20) NOT NULL,
    pf_no VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    doj DATE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_account VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payroll Table
CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee(id),
    pay_period_from DATE NOT NULL,
    pay_period_to DATE NOT NULL,
    paid_days NUMERIC(5, 2) NOT NULL,
    basic_pay NUMERIC(10, 2) NOT NULL,
    hra NUMERIC(10, 2) NOT NULL,
    transport NUMERIC(10, 2) NOT NULL,
    meal NUMERIC(10, 2) NOT NULL,
    total_earnings NUMERIC(10, 2) NOT NULL,
    income_tax NUMERIC(10, 2) NOT NULL,
    total_tax NUMERIC(10, 2) NOT NULL,
    pf_deduction NUMERIC(10, 2) NOT NULL,
    prof_tax NUMERIC(10, 2) NOT NULL,
    med_insurance NUMERIC(10, 2) NOT NULL,
    sodexo NUMERIC(10, 2) NOT NULL,
    deductions_total NUMERIC(10, 2) NOT NULL,
    net_pay NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
