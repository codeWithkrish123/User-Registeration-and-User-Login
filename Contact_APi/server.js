import express from 'express';
import mongoose from 'mongoose';
import { contact } from './Models/contact.js';
import {user} from './Models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
// jaha pe setup kiya mongodb waha ka link
mongoose.connect('mongodb://localhost:27017/Contact_API_Youtube')
  .then(() => console.log("MongoDB connected Successfully"))
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

//  GET all contacts- jismein sare contatcs aajayenge  iss basically Ending point
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET specific Contact
app.get('/api/contact/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // agar humara contact nahi milla to 
    const filterContact = await contact.findById(id);
    if (!filterContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }   
    res.json(filterContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new Contact
app.post('/api/contact/add', async (req, res) => {
  try {
    const { name, email, phone, type } = req.body;

    const newContact = new contact({
      name,
      email,
      phone,
      type
    });

    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Update Contact
app.put('/api/contact/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone, type } = req.body;

    if (name =='' || email ==''|| phone ==''||type == ''){
         return res.status(404).json({message:"All field required"});
        }

    const updateContact = await contact.findByIdAndUpdate(id, {
      name,
      email,
      phone,
      type,
    }, { new: true });

    if (!updateContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact updated successfully", updatedContact: updateContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Contact
app.delete('/api/contact/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleteContact = await contact.findByIdAndDelete(id);

    if (!deleteContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully", deletedContact: deleteContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// main yaha se hai.

// User Registration
app.post('/api/user/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(name ==''|| email==''||password==''){
        return res.status(400).json({message:"All required are field"});
    }

    // Check if user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // used concept bcrypt:
    const hashPass=  await bcrypt.hash(password,10); 

    // Create new user
    const newUser = new user({
      name,
      email,
      password:hashPass,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      message: "User Registration Successfully!",
      user: savedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




// User Login 
app.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

      if(email==''||password==''){
        return res.status(400).json({message:"All required are field"});
    }

    // Find user by email
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password (basic comparison - in production, use bcrypt)
    if (existingUser.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({  
      message: `Welcome back ${existingUser.name}`,
      user: existingUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  const token = jwt.sign({user},'!@#$%^&*()',{expiresIn:'id'});

});



const port = 1000;
app.listen(port, () => console.log(`Server is Running on ${port}`));