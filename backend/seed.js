const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'models', 'payroll.db');
const db = new sqlite3.Database(dbPath);

const names = [
    "ALICE SMITH", "BOB JOHNSON", "CHARLIE DAVIS", "DIANA PRINCE", "EVE ADAMS",
    "FRANK WRIGHT", "GRACE HOPPER", "HANK PYM", "IVY LEAGUE", "JACK REACHER"
];
const departments = ["ENGINEERING", "PRODUCT", "HR", "FINANCE", "MARKETING"];

async function seed() {
    try {
        console.log("Starting seed process for SQLite...");

        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('DROP TABLE IF EXISTS payroll;');
                db.run('DROP TABLE IF EXISTS employee;');

                db.run(`CREATE TABLE employee (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    pers_no TEXT UNIQUE NOT NULL,
                    pan TEXT NOT NULL,
                    uan TEXT NOT NULL,
                    pf_no TEXT NOT NULL,
                    designation TEXT NOT NULL,
                    department TEXT NOT NULL,
                    doj TEXT NOT NULL,
                    bank_name TEXT NOT NULL,
                    bank_account TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);

                db.run(`CREATE TABLE payroll (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id INTEGER REFERENCES employee(id),
                    pay_period_from TEXT NOT NULL,
                    pay_period_to TEXT NOT NULL,
                    paid_days REAL NOT NULL,
                    basic_pay REAL NOT NULL,
                    hra REAL NOT NULL,
                    transport REAL NOT NULL,
                    meal REAL NOT NULL,
                    total_earnings REAL NOT NULL,
                    income_tax REAL NOT NULL,
                    total_tax REAL NOT NULL,
                    pf_deduction REAL NOT NULL,
                    prof_tax REAL NOT NULL,
                    med_insurance REAL NOT NULL,
                    sodexo REAL NOT NULL,
                    deductions_total REAL NOT NULL,
                    net_pay REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        for (let i = 0; i < 10; i++) {
            const empName = names[i];
            const dept = departments[i % 5];
            const persNo = `EMP100${i}`;
            const pan = `ABCD${1000 + i}A`;
            const uan = `10001000${1000 + i}`;
            const pfNo = `PF00${i}`;
            const designation = "SENIOR ASSOCIATE";
            const doj = "2022-01-15";
            const bankName = "AXIS BANK";
            const bankAccount = `1234567890${i}`;

            const empId = await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO employee (name, pers_no, pan, uan, pf_no, designation, department, doj, bank_name, bank_account)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [empName, persNo, pan, uan, pfNo, designation, dept, doj, bankName, bankAccount],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });

            const basicPay = 50000 + (10000 * i);
            const hra = basicPay * 0.40;
            const transport = 1600;
            const meal = 2000;
            const totalE = basicPay + hra + transport + meal;
            const itax = 2000;
            const pf = basicPay * 0.12;
            const pt = 200;
            const mi = 500;
            const sdx = 1000;
            const deductions = pf + pt + mi + sdx;
            const net = totalE - itax - deductions;

            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO payroll (employee_id, pay_period_from, pay_period_to, paid_days, basic_pay, hra, transport, meal, total_earnings, income_tax, total_tax, pf_deduction, prof_tax, med_insurance, sodexo, deductions_total, net_pay)
                     VALUES (?, '2026-04-01', '2026-04-30', 30, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [empId, basicPay, hra, transport, meal, totalE, itax, itax, pf, pt, mi, sdx, deductions, net],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        
        console.log("Successfully seeded 10 dummy employees into the SQLite database!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to seed SQLite database:", err.message);
        process.exit(1);
    }
}
seed();