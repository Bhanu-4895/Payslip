const db = require('../models/db');

exports.createEmployee = async (req, res) => {
    try {
        const {
            name, persNo, pan, uan, pfNo, designation, department, doj,
            payPeriodFrom, payPeriodTo, paidDays, basicPay, transport, meal,
            incomeTax, pf, profTax, medInsurance, sodexo,
            bankName, bankAccount
        } = req.body;

        // Perform Calculations
        const bp = parseFloat(basicPay) || 0;
        const hra = bp * 0.50;
        const tp = parseFloat(transport) || 0;
        const ml = parseFloat(meal) || 0;
        const totalEarnings = bp + hra + tp + ml;

        const itax = parseFloat(incomeTax) || 0;
        const totalTax = itax;

        const pfc = bp * 0.12;
        const ptax = parseFloat(profTax) || 0;
        const mIns = parseFloat(medInsurance) || 0;
        const sdx = parseFloat(sodexo) || 0;
        const deductionsTotal = pfc + ptax + mIns + sdx;

        const netPay = totalEarnings - totalTax - deductionsTotal;
        
        // Use paidDays from frontend
        const pd = parseFloat(paidDays) || 30;

        // Insert Employee
        const empResult = await db.query(
            `INSERT INTO employee (name, pers_no, pan, uan, pf_no, designation, department, doj, bank_name, bank_account)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [name, persNo, pan, uan, pfNo, designation, department, doj, bankName, bankAccount]
        );
        const empId = empResult.rows[0].id;

        // Insert Payroll
        const prResult = await db.query(
            `INSERT INTO payroll (
                employee_id, pay_period_from, pay_period_to, paid_days, basic_pay, hra, transport, meal, total_earnings,
                income_tax, total_tax, pf_deduction, prof_tax, med_insurance, sodexo, deductions_total, net_pay
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
            [
                empId, payPeriodFrom, payPeriodTo, pd, bp, hra, tp, ml, totalEarnings,
                itax, totalTax, pfc, ptax, mIns, sdx, deductionsTotal, netPay
            ]
        );

        res.status(201).json({ success: true, employeeId: empId, payrollId: prResult.rows[0].id });
    } catch (error) {
        console.error(error);
        require('fs').writeFileSync('error.log', error.stack || error.toString());
        res.status(500).json({ error: "Failed to save employee data" });
    }
};

exports.searchEmployee = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Split query into words for flexible name matching
        const words = q.trim().split(/\s+/);
        const nameConditions = words.map((_, i) => `e.name ILIKE $${i + 2}`).join(' AND ');
        
        // $1 is the full string for exact/partial match on pers_no or pan
        // $2, $3... are the individual words for name matching
        const queryParams = [`%${q.trim()}%`, ...words.map(w => `%${w}%`)];

        const result = await db.query(
            `SELECT e.id, e.name, e.pers_no, e.pan, p.id as payroll_id, p.pay_period_from, p.pay_period_to 
             FROM employee e
             JOIN payroll p ON e.id = p.employee_id
             WHERE (${nameConditions}) OR e.pers_no ILIKE $1 OR e.pan ILIKE $1
             ORDER BY p.created_at DESC LIMIT 10`,
            queryParams
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Search failed" });
    }
};

exports.getPayslip = async (req, res) => {
    try {
        const { id } = req.params; // Document ID (payroll ID)
        
        const result = await db.query(
            `SELECT e.*, p.* 
             FROM payroll p
             JOIN employee e ON p.employee_id = e.id
             WHERE p.id = $1`,
            [id]
        );
        
        if(result.rows.length === 0) return res.status(404).json({ error: "Payslip not found" });

        const data = result.rows[0];
        
        // Format to UI layout requirements precisely
        const ytdMulti = 12; // YTD equals 12 * Current
        const formatDt = (dt) => {
            if (!dt) return '';
            const d = new Date(dt);
            return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getFullYear()).slice(-2)}`;
        };

        const formattedData = {
            employee: {
                name: data.name, designation: data.designation, department: data.department,
                pf_no: data.pf_no, pers_no: data.pers_no, pan: data.pan, doj: data.doj,
                uan: data.uan, bank_name: data.bank_name, bank_account: data.bank_account
            },
            payroll: {
                payPeriod: `${formatDt(data.pay_period_from)} to ${formatDt(data.pay_period_to)}`,
                paidDays: Number(data.paid_days).toFixed(2),
                netPay: Number(data.net_pay).toFixed(2),
                monthYear: data.pay_period_from ? new Date(data.pay_period_from).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : ''
            },
            earnings: [
                { label: "Gross Pay", current: Number(data.basic_pay).toFixed(2), ytd: (Number(data.basic_pay)*ytdMulti).toFixed(2) },
                { label: "HRA", current: Number(data.hra).toFixed(2), ytd: (Number(data.hra)*ytdMulti).toFixed(2) },
                { label: "Transport Allowance", current: Number(data.transport).toFixed(2), ytd: (Number(data.transport)*ytdMulti).toFixed(2) },
                { label: "Meal Coupon", current: Number(data.meal).toFixed(2), ytd: (Number(data.meal)*ytdMulti).toFixed(2) },
            ],
            taxes: [
                { label: "Income Tax", current: Number(data.income_tax).toFixed(2), ytd: (Number(data.income_tax)*ytdMulti).toFixed(2) }
            ],
            deductions: [
                { label: "EE PF contribution", current: Number(data.pf_deduction).toFixed(2), ytd: (Number(data.pf_deduction)*ytdMulti).toFixed(2) },
                { label: "Prof Tax - Full period", current: Number(data.prof_tax).toFixed(2), ytd: (Number(data.prof_tax)*ytdMulti).toFixed(2) },
                { label: "Med. Insurance - Sr Citizen", current: Number(data.med_insurance).toFixed(2), ytd: (Number(data.med_insurance)*ytdMulti).toFixed(2) },
                { label: "Sodexo Deduction", current: Number(data.sodexo).toFixed(2), ytd: (Number(data.sodexo)*ytdMulti).toFixed(2) },
            ],
            totals: {
                earnings: Number(data.total_earnings).toFixed(2),
                ytdEarnings: (Number(data.total_earnings) * ytdMulti).toFixed(2),
                tax: Number(data.total_tax).toFixed(2),
                ytdTax: (Number(data.total_tax) * ytdMulti).toFixed(2),
                deductions: Number(data.deductions_total).toFixed(2),
                ytdDeductions: (Number(data.deductions_total) * ytdMulti).toFixed(2)
            }
        };

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Fetch failed" });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT e.*, p.id as payroll_id, p.pay_period_from, p.pay_period_to 
             FROM employee e
             LEFT JOIN payroll p ON p.id = (
                 SELECT id FROM payroll WHERE employee_id = e.id ORDER BY created_at DESC LIMIT 1
             )
             ORDER BY e.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT e.*, p.id as payroll_id, p.pay_period_from, p.pay_period_to, p.basic_pay, p.hra, p.transport, p.meal, p.income_tax, p.pf_deduction, p.prof_tax, p.med_insurance, p.sodexo 
             FROM employee e
             LEFT JOIN payroll p ON p.id = (
                 SELECT id FROM payroll WHERE employee_id = e.id ORDER BY created_at DESC LIMIT 1
             )
             WHERE e.id = $1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Employee not found" });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch employee" });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, persNo, pan, uan, pfNo, designation, department, doj,
            payPeriodFrom, payPeriodTo, paidDays, basicPay, transport, meal,
            incomeTax, pf, profTax, medInsurance, sodexo,
            bankName, bankAccount, payrollId
        } = req.body;

        const bp = parseFloat(basicPay) || 0;
        const hra = bp * 0.50;
        const tp = parseFloat(transport) || 0;
        const ml = parseFloat(meal) || 0;
        const totalEarnings = bp + hra + tp + ml;

        const itax = parseFloat(incomeTax) || 0;
        const totalTax = itax;

        const pfc = bp * 0.12;
        const ptax = parseFloat(profTax) || 0;
        const mIns = parseFloat(medInsurance) || 0;
        const sdx = parseFloat(sodexo) || 0;
        const deductionsTotal = pfc + ptax + mIns + sdx;

        const netPay = totalEarnings - totalTax - deductionsTotal;
        const pd = parseFloat(paidDays) || 30;

        await db.query(
            `UPDATE employee SET name=$1, pers_no=$2, pan=$3, uan=$4, pf_no=$5, designation=$6, department=$7, doj=$8, bank_name=$9, bank_account=$10 WHERE id=$11`,
            [name, persNo, pan, uan, pfNo, designation, department, doj, bankName, bankAccount, id]
        );

        if (payrollId) {
            await db.query(
                `UPDATE payroll SET pay_period_from=$1, pay_period_to=$2, paid_days=$3, basic_pay=$4, hra=$5, transport=$6, meal=$7, total_earnings=$8, income_tax=$9, total_tax=$10, pf_deduction=$11, prof_tax=$12, med_insurance=$13, sodexo=$14, deductions_total=$15, net_pay=$16 WHERE id=$17`,
                [payPeriodFrom, payPeriodTo, pd, bp, hra, tp, ml, totalEarnings, itax, totalTax, pfc, ptax, mIns, sdx, deductionsTotal, netPay, payrollId]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update employee" });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM payroll WHERE employee_id = $1`, [id]);
        await db.query(`DELETE FROM employee WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete employee" });
    }
};
