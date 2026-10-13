/**
 * routes/enquiries.js
 * Express router for customer inquiries and custom print requests
 */

const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry.js');

// POST /api/enquiries - Submit customer inquiry/message directly into MongoDB
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!message || message.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please write a brief message or custom size inquiry.' });
    }

    const newEnquiry = await Enquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'Custom Gallery Print Request',
      message: message.trim()
    });

    console.log('[MongoDB] New enquiry saved:', newEnquiry._id, 'from:', newEnquiry.name);

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received. Our studio will reply within 24 hours.',
      enquiry: {
        id: newEnquiry._id,
        name: newEnquiry.name,
        email: newEnquiry.email,
        createdAt: newEnquiry.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving enquiry to MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record inquiry. Please try again later.'
    });
  }
});

// GET /api/enquiries - Retrieve all inquiries from MongoDB
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    console.error('Error retrieving enquiries from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load enquiries.'
    });
  }
});

module.exports = router;
