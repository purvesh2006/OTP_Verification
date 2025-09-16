// import dotenv from 'dotenv';
// dotenv.config();

// console.log('SID:', process.env.TWILIO_ACCOUNT_SID);

// import twilio from 'twilio';

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );


// import express from 'express';
// const app = express();

// // allow JSON body in requests
// app.use(express.json());

// app.post('/send-otp', async (req, res) => {
//   const { phone } = req.body; // frontend will send JSON: { "phone": "+91xxxxxxxxxx" }

//   try {
//     const verification = await client.verify.v2
//       .services(process.env.TWILIO_SERVICE_SID)
//       .verifications.create({
//         to: phone,
//         channel: 'sms',
//       });

//     res.json({ status: verification.status }); // should be "pending"
//   } catch (err) {
//     console.error('Error sending OTP:', err);
//     res.status(500).json({ error: 'Failed to send OTP' });
//   }
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import dotenv from 'dotenv';
dotenv.config();

console.log('SID:', process.env.TWILIO_ACCOUNT_SID);

import twilio from 'twilio';
import express from 'express';
import cors from 'cors';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample worker database (replace with actual database)
const workers = new Map([
  ['WKR001', {
    id: 'WKR001',
    name: 'Gokul Nair',
    phone: '+919820584759', // Replace with actual phone number
    department: 'Engineering',
    designation: 'Senior Engineer',
    joinDate: '2020-03-15',
    email: 'john.doe@company.com',
    status: 'Active',
    employeeId: 'EMP001',
    shift: 'Morning',
    supervisor: 'Mike Johnson'
  }],
  ['WKR002', {
    id: 'WKR002',
    name: 'Jane Smith',
    phone: '+919876543211', // Replace with actual phone number
    department: 'HR',
    designation: 'HR Manager',
    joinDate: '2019-07-22',
    email: 'jane.smith@company.com',
    status: 'Active',
    employeeId: 'EMP002',
    shift: 'Morning',
    supervisor: 'Sarah Wilson'
  }],
  ['WKR003', {
    id: 'WKR003',
    name: 'Alice Johnson',
    phone: '+919876543212', // Replace with your actual phone number for testing
    department: 'Production',
    designation: 'Production Supervisor',
    joinDate: '2021-01-10',
    email: 'alice.johnson@company.com',
    status: 'Active',
    employeeId: 'EMP003',
    shift: 'Evening',
    supervisor: 'Robert Brown'
  }]
]);

// Route to verify QR code (Worker ID) and send OTP
app.post('/verify-qr', async (req, res) => {
  const { workerId } = req.body;
  
  try {
    console.log('Received Worker ID:', workerId);
    
    // Check if worker exists
    const worker = workers.get(workerId);
    if (!worker) {
      return res.status(404).json({ 
        success: false, 
        error: 'Worker ID not found' 
      });
    }

    // Send OTP to worker's phone
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: worker.phone,
        channel: 'sms',
      });

    console.log('OTP sent to:', worker.phone);
    console.log('Verification status:', verification.status);

    res.json({ 
      success: true,
      status: verification.status,
      message: 'OTP sent successfully',
      workerId: workerId,
      maskedPhone: worker.phone.replace(/(\+91)(\d{6})(\d{4})/, '$1******$3')
    });

  } catch (error) {
    console.error('Error in /verify-qr:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send OTP' 
    });
  }
});

// Your existing send-otp endpoint (keeping for backward compatibility)
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });

    res.json({ status: verification.status });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Route to verify OTP and get worker details
app.post('/verify-otp', async (req, res) => {
  const { workerId, otp } = req.body;
  
  try {
    console.log('Verifying OTP for Worker ID:', workerId, 'OTP:', otp);
    
    // Get worker details
    const worker = workers.get(workerId);
    if (!worker) {
      return res.status(404).json({ 
        success: false, 
        error: 'Worker not found' 
      });
    }

    // Verify OTP with Twilio
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: worker.phone,
        code: otp
      });

    console.log('OTP verification status:', verificationCheck.status);

    if (verificationCheck.status === 'approved') {
      res.json({
        success: true,
        message: 'Authentication successful',
        worker: worker
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

  } catch (error) {
    console.error('Error in /verify-otp:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify OTP' 
    });
  }
});

// Route to get worker details (optional, for additional security)
app.get('/worker/:id', (req, res) => {
  const { id } = req.params;
  const worker = workers.get(id);
  
  if (!worker) {
    return res.status(404).json({ 
      success: false, 
      error: 'Worker not found' 
    });
  }
  
  res.json({ 
    success: true, 
    worker: worker 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

