// === FINAL BACKEND CODE: server.js ===
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const db = require('./db'); // ✅ Make sure db.js exports a MySQL pool

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ LOGIN API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.status(200).send({ message: 'Login successful' });
  } else {
    res.status(401).send({ message: 'Invalid credentials' });
  }
});

// ✅ ADD OWNER API
app.post('/add-owner', async (req, res) => {
  const { id, name, area, email } = req.body;

  if (!id || !name || !area || !email) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    await db.query(
      'INSERT INTO owners (id, name, area, email) VALUES (?, ?, ?, ?)',
      [id, name, area, email]
    );
    res.status(200).send({ message: 'Owner added successfully' });
  } catch (err) {
    console.error("MySQL error adding owner:", err);
    res.status(500).send({ message: 'Error adding owner', error: err.message });
  }
});

// ✅ ADD VEHICLE API
app.post('/add-vehicle', async (req, res) => {
  const { number, type, fuel, age, ownerId } = req.body;

  if (!number || !type || !fuel || !age || !ownerId) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    await db.query(
      'INSERT INTO vehicles (number, type, fuel, age, ownerId) VALUES (?, ?, ?, ?, ?)',
      [number, type, fuel, age, ownerId]
    );
    res.status(200).send({ message: 'Vehicle added successfully' });
  } catch (err) {
    console.error("Error inserting vehicle:", err);
    res.status(500).send({ message: 'Error adding vehicle', error: err.message });
  }
});

// ✅ POLLUTION ANALYSIS FUNCTION
function analyzePollution(type, fuel, age) {
  if (!type || !fuel || age == null) return 'Unknown';

  const t = type.toLowerCase();
  const f = fuel.toLowerCase();
  const a = parseInt(age);

  if (f === 'electric') return 'Low';
  if (f === 'cng') return 'Moderate';

  if (t === 'car') {
    if (f === 'diesel') return a > 10 ? 'High' : 'Moderate';
    if (f === 'petrol') return a > 15 ? 'High' : 'Moderate';
    return 'Low';
  }

  if (t === 'bike' || t === 'scooty') {
    if (f === 'petrol') return a > 12 ? 'Moderate' : 'Low';
    return 'Low';
  }

  if (t === 'auto') {
    return f === 'diesel' ? 'High' : 'Moderate';
  }

  if (t === 'bus') {
    return a > 8 ? 'High' : 'Moderate';
  }

  if (t === 'lorry') {
    return a > 5 ? 'High' : 'Moderate';
  }

  return 'Moderate';
}

// ✅ DASHBOARD API
app.get('/dashboard', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.number, v.type, v.fuel AS fuelType, v.age, v.ownerId,
             o.email, o.area
      FROM vehicles v
      JOIN owners o ON v.ownerId = o.id
    `);

    const result = rows.map(row => ({
      ...row,
      pollutionLevel: analyzePollution(row.type, row.fuelType, row.age)
    }));

    res.status(200).send(result);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send({ message: 'Error fetching dashboard data', error: err.toString() });
  }
});

// ✅ SEND EMAIL RESULT API
app.post('/send-result', async (req, res) => {
  const { email, result } = req.body;

  if (!email || !result) {
    return res.status(400).send({ message: 'Missing email or result' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'divyakasarla977@gmail.com',
        pass: '' // 🔐 App password
      },
    });

    const mailOptions = {
      from: 'divyakasarla977@gmail.com',
      to: email,
      subject: 'Vehicle Pollution Analysis Result',
      text: `Your vehicle's pollution level is: ${result}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).send({ message: 'Email failed', error: err.toString() });
  }
});

// ✅ START SERVER
app.listen(5000, () => {
  console.log(' Server running on http://localhost:5000');
});
