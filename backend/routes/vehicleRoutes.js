// const express = require("express");
// const router = express.Router();
// const Vehicle = require("../models/Vehicle");
// const upload = require("../middleware/uploadMiddleware");

// // ✅ GET all vehicles
// router.get("/", async (req, res) => {
//   try {
//     const vehicles = await Vehicle.find().sort({ createdAt: -1 });
//     res.json(vehicles);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// // ✅ POST add vehicle (with image)
// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     const {
//       name,
//       brand,
//       model,
//       year,
//       type,
//       seats,
//       transmission,
//       fuel,
//       pricePerDay,
//       location,
//       available,
//       description,
//     } = req.body;

//     if (!name || !brand || !model || !year || !pricePerDay) {
//       return res.status(400).json({ msg: "Required: name, brand, model, year, pricePerDay" });
//     }

//     const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

//     const vehicle = await Vehicle.create({
//       name,
//       brand,
//       model,
//       year: Number(year),
//       type,
//       seats: Number(seats || 4),
//       transmission,
//       fuel,
//       pricePerDay: Number(pricePerDay),
//       location,
//       available: available === "true" || available === true,
//       description,
//       image: imagePath,
//     });

//     res.status(201).json(vehicle);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;




// backend/routes/vehicleRoutes.js
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const upload = require("../middleware/uploadMiddleware");
const { protect, verifiedOwner } = require("../middleware/authMiddleware");

// ✅ GET all vehicles with filtering, sorting, searching, and pagination
router.get("/", async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      fuel,
      transmission,
      seats,
      location,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let query = { available: true, verificationStatus: "approved" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }
    
    if (req.query.type) {
      const types = req.query.type.split(',').filter(Boolean);
      if (types.length > 0) {
        query.type = { $in: types };
      }
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    if (fuel) query.fuel = fuel;
    if (transmission) query.transmission = transmission;
    
    if (seats) {
      if (Number(seats) === 7) {
        query.seats = { $gte: 7 };
      } else {
        query.seats = Number(seats);
      }
    }
    if (location) query.location = { $regex: location, $options: "i" };

    if (req.query.available !== undefined) {
      query.available = req.query.available === "true";
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "priceLow") sortOptions = { pricePerDay: 1 };
    else if (sort === "priceHigh") sortOptions = { pricePerDay: -1 };
    else if (sort === "newest") sortOptions = { createdAt: -1 };

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 12;
    const skip = (pageNumber - 1) * pageSize;

    const vehicles = await Vehicle.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Vehicle.countDocuments(query);

    res.json({
      vehicles,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (err) {
    console.error("Get vehicles error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ POST add vehicle (WITH categorized photos)
router.post("/", protect, verifiedOwner, upload.fields([{ name: "exteriorImages", maxCount: 5 }, { name: "interiorImages", maxCount: 5 }]), async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      year,
      type,
      seats,
      transmission,
      fuel,
      pricePerDay,
      location,
      latitude,
      longitude,
      available,
      description,
    } = req.body;

    if (!name || !brand || !model || !year || !pricePerDay) {
      return res
        .status(400)
        .json({ msg: "Required: name, brand, model, year, pricePerDay" });
    }

    const exteriorPaths = req.files?.exteriorImages 
      ? req.files.exteriorImages.map(f => ({ url: `/uploads/${f.filename}`, type: "exterior" })) 
      : [];
      
    const interiorPaths = req.files?.interiorImages 
      ? req.files.interiorImages.map(f => ({ url: `/uploads/${f.filename}`, type: "interior" })) 
      : [];
      
    const imageObjects = [...exteriorPaths, ...interiorPaths];

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      name,
      brand,
      model,
      year: Number(year),
      type: type || "Sedan",
      seats: Number(seats || 4),
      transmission: transmission || "Automatic",
      fuel: fuel || "Petrol",
      condition: req.body.condition || "Excellent",
      mileage: req.body.mileage || "",
      pricePerDay: Number(pricePerDay),
      location: location || "Kathmandu",
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      available: available === "true" || available === true,
      description: description || "",
      images: imageObjects,
      // Require admin approval before showing in fleet
      verificationStatus: "pending",
      isPublic: false,
      isVerified: false,
      isBookable: false,
    });

    res.status(201).json(vehicle);
  } catch (err) {
    console.error("Add vehicle error:", err);
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

// ✅ GET similar vehicles
router.get("/similar", async (req, res) => {
  try {
    const { price, location, excludeId } = req.query;
    let query = { available: true, verificationStatus: "approved" };

    if (excludeId) {
       query._id = { $ne: excludeId };
    }

    if (price) {
       const p = Number(price);
       // Price range +/- 20%
       query.pricePerDay = { $gte: p * 0.8, $lte: p * 1.2 };
    }

    if (location) {
       // Extract base city name if location is complex, or just use regex
       const baseLocation = location.split(',')[0].trim();
       query.location = { $regex: baseLocation, $options: "i" };
    }

    const vehicles = await Vehicle.find(query).limit(6).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error("Get similar vehicles error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET single vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    
    // Check if req is coming from owner directly (we don't have protect here, so we just return it)
    // Actually the frontend might fetch it anonymously if it's public.
    // If not public or approved, we need to ensure we don't break public listings.
    // For simplicity, we just return the vehicle. Our frontend UI will block non-owners from editing.
    res.json(vehicle);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    console.error("Get single vehicle error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET logged-in owner's vehicles
router.get("/owner/my-listings", protect, verifiedOwner, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { owner: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error("Get my listings error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ PUT owner resubmits rejected vehicle
router.put("/:id/resubmit", protect, verifiedOwner, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (vehicle.verificationStatus !== "rejected") {
      return res.status(400).json({ msg: "Only rejected vehicles can be resubmitted" });
    }

    vehicle.verificationStatus = "pending";
    vehicle.isPublic = false;
    vehicle.isBookable = false;
    vehicle.isVerified = false;
    vehicle.rejectionReason = "";
    
    await vehicle.save();
    res.json({ msg: "Vehicle resubmitted for admin review", vehicle });
  } catch (err) {
    console.error("Resubmit error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ PUT update vehicle
router.put("/:id", protect, verifiedOwner, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized to edit this vehicle" });
    }

    const {
      name, brand, model, year, type, seats, transmission, fuel,
      pricePerDay, location, latitude, longitude, available, description
    } = req.body;

    vehicle.name = name || vehicle.name;
    vehicle.brand = brand || vehicle.brand;
    vehicle.model = model || vehicle.model;
    if (year) vehicle.year = Number(year);
    vehicle.type = type || vehicle.type;
    if (seats) vehicle.seats = Number(seats);
    vehicle.transmission = transmission || vehicle.transmission;
    vehicle.fuel = fuel || vehicle.fuel;
    if (pricePerDay) vehicle.pricePerDay = Number(pricePerDay);
    vehicle.location = location || vehicle.location;
    if (latitude !== undefined) vehicle.latitude = Number(latitude);
    if (longitude !== undefined) vehicle.longitude = Number(longitude);
    
    if (available !== undefined) {
       vehicle.available = available === "true" || available === true;
    }
    
    vehicle.description = description !== undefined ? description : vehicle.description;

    await vehicle.save();
    res.json({ msg: "Vehicle updated successfully", vehicle });
  } catch (err) {
    console.error("Update vehicle error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
