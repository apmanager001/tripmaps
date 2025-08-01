const Contact = require("../model/contact");
const { validateContact } = require("../middleware/validation");

// Submit a new contact form
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Validation
    const validation = validateContact(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Create contact submission
    const contactData = {
      name,
      email,
      subject,
      message,
      category: category || "general",
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    // If user is logged in, associate with their account
    if (req.user) {
      contactData.userId = req.user._id;
    }

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      message:
        "Contact form submitted successfully. We'll get back to you soon!",
      data: {
        id: contact._id,
        submittedAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form. Please try again.",
    });
  }
};

// Get all contacts (admin/moderator only)
const getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .populate("userId", "username email")
      .populate("assignedTo", "username email")
      .populate("resolvedBy", "username email")
      .populate("notes.addedBy", "username")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Contact.countDocuments(filter);

    // Get statistics
    const stats = await Contact.getStats();

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalContacts: total,
          hasNextPage: skip + contacts.length < total,
          hasPrevPage: parseInt(page) > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
};

// Get single contact by ID (admin/moderator only)
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id)
      .populate("userId", "username email")
      .populate("assignedTo", "username email")
      .populate("resolvedBy", "username email")
      .populate("notes.addedBy", "username");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact",
    });
  }
};

// Update contact status (admin/moderator only)
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (assignedTo) contact.assignedTo = assignedTo;

    // If status is being set to resolved, set resolved info
    if (status === "resolved" && !contact.resolvedAt) {
      contact.resolvedAt = new Date();
      contact.resolvedBy = req.user._id;
    }

    await contact.save();

    // Populate the updated contact
    const updatedContact = await Contact.findById(id)
      .populate("userId", "username email")
      .populate("assignedTo", "username email")
      .populate("resolvedBy", "username email")
      .populate("notes.addedBy", "username");

    res.json({
      success: true,
      message: "Contact status updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact status",
    });
  }
};

// Add note to contact (admin/moderator only)
const addContactNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await contact.addNote(note.trim(), req.user._id);

    // Get updated contact with populated fields
    const updatedContact = await Contact.findById(id)
      .populate("userId", "username email")
      .populate("assignedTo", "username email")
      .populate("resolvedBy", "username email")
      .populate("notes.addedBy", "username");

    res.json({
      success: true,
      message: "Note added successfully",
      data: updatedContact,
    });
  } catch (error) {
    console.error("Add contact note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
    });
  }
};

// Delete contact (admin only)
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
    });
  }
};

// Get contact statistics (admin/moderator only)
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.getStats();

    // Get recent contacts count
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    });

    // Get unassigned contacts count
    const unassignedContacts = await Contact.countDocuments({
      assignedTo: { $exists: false },
      status: { $in: ["new", "in-progress"] },
    });

    res.json({
      success: true,
      data: {
        ...stats,
        recentContacts,
        unassignedContacts,
      },
    });
  } catch (error) {
    console.error("Get contact stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact statistics",
    });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  addContactNote,
  deleteContact,
  getContactStats,
};
