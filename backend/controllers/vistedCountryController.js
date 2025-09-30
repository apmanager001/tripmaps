// GET /users/:userId/visited-countries
exports.getVisitedCountries = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: "visitedCountries",
      select: "name flagUrl",
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.visitedCountries);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
const User = require("../model/user");

// POST /users/visited-countries
// Body: { countryId }
exports.addVisitedCountry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { countryId } = req.body;
    if (!countryId) {
      return res.status(400).json({ error: "countryId is required" });
    }
    // Check if country exists
    const country = await Country.findById(countryId);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    // Add to visitedCountries if not already present
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { visitedCountries: countryId } },
      { new: true }
    ).populate("visitedCountries");
    res.json(user.visitedCountries);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /users/visited-countries/:countryId
exports.removeVisitedCountry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { countryId } = req.params;
    // Remove from visitedCountries
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { visitedCountries: countryId } },
      { new: true }
    ).populate("visitedCountries");
    res.json(user.visitedCountries);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
const Country = require("../model/country");

// GET /search-country?name=countryName
exports.searchCountryByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Country name is required" });
    }
    // Case-insensitive search for country name
    const countries = await Country.find({
      name: { $regex: new RegExp(name, "i") },
    });
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
