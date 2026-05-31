const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

// @route   POST /api/chats/start
// @desc    Create or get existing conversation
// @access  Private
router.post("/start", protect, async (req, res) => {
  try {
    const { vehicleId, bookingId } = req.body;
    
    if (!vehicleId) {
      return res.status(400).json({ msg: "Vehicle ID is required" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }

    const ownerId = vehicle.owner;
    const customerId = req.user.id;

    if (ownerId.toString() === customerId.toString()) {
      return res.status(400).json({ msg: "You cannot start a chat with yourself" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      vehicle: vehicleId,
      customer: customerId,
      owner: ownerId,
    });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [customerId, ownerId],
      customer: customerId,
      owner: ownerId,
      vehicle: vehicleId,
      booking: bookingId || null,
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET /api/chats
// @desc    Get all conversations for logged-in user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("customer", "name email")
      .populate("owner", "name email")
      .populate("vehicle", "name brand model images pricePerDay")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET /api/chats/:id/messages
// @desc    Get messages for a conversation
// @access  Private
router.get("/:id/messages", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST /api/chats/:id/messages
// @desc    Send a message
// @access  Private
router.post("/:id/messages", protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Message text is required" });
    }
    if (text.length > 1000) {
      return res.status(400).json({ msg: "Message is too long (max 1000 characters)" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized to send messages in this conversation" });
    }

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== req.user.id.toString()
    );

    const message = new Message({
      conversation: req.params.id,
      sender: req.user.id,
      receiver: receiverId,
      text: text.trim(),
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = Date.now();
    
    // Add receiver to unreadBy if not already there
    if (!conversation.unreadBy.includes(receiverId)) {
      conversation.unreadBy.push(receiverId);
    }
    
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PATCH /api/chats/:id/read
// @desc    Mark a conversation as read
// @access  Private
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Remove user from unreadBy
    conversation.unreadBy = conversation.unreadBy.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );
    await conversation.save();

    // Update all messages sent to user as read
    await Message.updateMany(
      { conversation: req.params.id, receiver: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ msg: "Conversation marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
