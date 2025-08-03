const express = require("express");
const router = express.Router();

// Import controllers
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
} = require("../controllers/authcontroller");

const {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  searchUsers,
  getTopUsers,
  deleteUserAccount,
} = require("../controllers/userController");

const {
  createMap,
  getMap,
  getUserMaps,
  updateMap,
  deleteMap,
  toggleMapPrivacy,
  searchMaps,
  getPopularMaps,
  toggleMapLike,
} = require("../controllers/mapController");

const {
  createPOI,
  getPOI,
  updatePOI,
  deletePOI,
  getPOIsByMap,
  getUserPOIs,
  searchUserPOIs,
  searchPOIsByLocation,
  searchPOIsByName,
  searchPOIsComprehensive,
  searchMapsByPOIName,
  togglePOILike,
  getPopularLocations,
  getPopularPOIs,
  addPOIToMap,
} = require("../controllers/poiController");

const { getAllTags, createTag } = require("../controllers/tagController");

const {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} = require("../controllers/stripeController");

const {
  uploadPhoto,
  getPOIPhotos,
  setPrimaryPhoto,
  deletePhoto,
  getUserPhotos,
  updatePhoto,
} = require("../controllers/photoController");

const {
  uploadProfilePicture,
  deleteProfilePicture,
  getUserProfile: getProfile,
  updateUserProfile: updateProfile,
} = require("../controllers/profileController");

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  bookmarkMap,
  removeBookmark,
  getUserBookmarks,
  addComment,
  getMapComments,
  deleteComment,
  likeComment,
  unlikeComment,
} = require("../controllers/socialController");

const {
  createFlag,
  getAllFlags,
  updateFlagStatus,
  getFlagsByUser,
  checkUserFlag,
} = require("../controllers/flagController");

const {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  addContactNote,
  deleteContact,
  getContactStats,
} = require("../controllers/contactController");

const { jwtAuth, optionalJwtAuth } = require("../helpers/jwtAuth");
const {
  validateRegistration,
  validateLogin,
  validateMapData,
} = require("../middleware/validation");
const { checkPOILimit, checkMapLimit } = require("../middleware/limits");
const { upload } = require("../services/s3Service");
const { upload: profileUpload } = require("../services/profilePictureService");

// ===== AUTHENTICATION ROUTES =====
router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/verifyUser", verifyUser);

// ===== OAUTH ROUTES =====
router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleCallback);
router.get("/auth/facebook", facebookAuth);
router.get("/auth/facebook/callback", facebookCallback);

// ===== USER ROUTES =====
router.get("/users/profile/:id", optionalJwtAuth, getUserProfile);
router.put("/users/profile/:id", jwtAuth, updateUserProfile);
router.get("/users/dashboard/:id", jwtAuth, getUserDashboard);
router.get("/users/search", searchUsers);
router.get("/users/top", getTopUsers);
router.delete("/users/:id", jwtAuth, deleteUserAccount);

// ===== PROFILE PICTURE ROUTES =====
router.post(
  "/users/profile-picture",
  jwtAuth,
  profileUpload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/users/profile-picture", jwtAuth, deleteProfilePicture);
router.get("/users/:userId/profile", getProfile);
router.put("/users/profile", jwtAuth, updateProfile);

// ===== MAP ROUTES =====
router.post("/maps", jwtAuth, checkMapLimit, validateMapData, createMap);
router.get("/maps/search", optionalJwtAuth, searchMaps);
router.get("/maps/popular", optionalJwtAuth, getPopularMaps);
router.get("/maps/:id", optionalJwtAuth, getMap);
router.get("/users/:userId/maps", optionalJwtAuth, getUserMaps);
router.put("/maps/:id", jwtAuth, updateMap);
router.delete("/maps/:id", jwtAuth, deleteMap);
router.patch("/maps/:id/privacy", jwtAuth, toggleMapPrivacy);
router.post("/maps/:id/like", jwtAuth, toggleMapLike);

// ===== POI ROUTES =====
router.post("/pois", jwtAuth, checkPOILimit, createPOI);
router.get("/pois/user", jwtAuth, getUserPOIs);
router.get("/pois/user/search", jwtAuth, searchUserPOIs);
router.get("/pois/search/location", searchPOIsByLocation);
router.get("/pois/search/name", searchPOIsByName);
router.get("/pois/search", searchPOIsComprehensive);
router.get("/pois/search/maps/:poiName", searchMapsByPOIName);
router.get("/pois/popular-locations", getPopularLocations);
router.get("/pois/popular", getPopularPOIs);
router.get("/pois/:id", getPOI);
router.put("/pois/:id", jwtAuth, updatePOI);
router.delete("/pois/:id", jwtAuth, deletePOI);
router.get("/maps/:mapId/pois", getPOIsByMap);
router.post("/maps/:mapId/pois/:poiId", jwtAuth, addPOIToMap);
router.post("/pois/:id/like", jwtAuth, togglePOILike);

// ===== TAG ROUTES =====
router.get("/tags", getAllTags);
router.post("/tags", jwtAuth, createTag);

// ===== SOCIAL ROUTES =====
// Friend management
router.post("/users/:userId/follow", jwtAuth, followUser);
router.delete("/users/:userId/follow", jwtAuth, unfollowUser);
router.get("/users/:userId/followers", getFollowers);
router.get("/users/:userId/following", getFollowing);

// Bookmark management
router.post("/maps/:mapId/bookmark", jwtAuth, bookmarkMap);
router.delete("/maps/:mapId/bookmark", jwtAuth, removeBookmark);
router.get("/users/:userId/bookmarks", jwtAuth, getUserBookmarks);

// Comment management
router.post("/maps/:mapId/comments", jwtAuth, addComment);
router.get("/maps/:mapId/comments", getMapComments);
router.delete("/comments/:commentId", jwtAuth, deleteComment);

// Comment like management
router.post("/comments/:commentId/like", jwtAuth, likeComment);
router.delete("/comments/:commentId/like", jwtAuth, unlikeComment);

// ===== STRIPE ROUTES =====
router.post("/stripe/create-checkout-session", jwtAuth, createCheckoutSession);
router.post("/stripe/webhook", handleWebhook);
router.get("/stripe/subscription/:userId", jwtAuth, getSubscriptionStatus);
router.post("/stripe/cancel-subscription", jwtAuth, cancelSubscription);

// ===== PHOTO ROUTES =====
router.post(
  "/pois/:poiId/photos",
  jwtAuth,
  upload.single("photo"),
  uploadPhoto
);
router.get("/pois/:poiId/photos", getPOIPhotos);
router.patch("/photos/:photoId/primary", jwtAuth, setPrimaryPhoto);
router.delete("/photos/:photoId", jwtAuth, deletePhoto);
router.get("/users/:userId/photos", getUserPhotos);
router.put("/photos/:photoId", jwtAuth, updatePhoto);

// ===== FLAG ROUTES =====
router.post("/flags", jwtAuth, createFlag);
router.get("/flags", jwtAuth, getAllFlags);
router.put("/flags/:flagId/status", jwtAuth, updateFlagStatus);
router.get("/flags/user", jwtAuth, getFlagsByUser);
router.get("/flags/check/:photoId", jwtAuth, checkUserFlag);

// ===== CONTACT ROUTES =====
// Public contact form submission
router.post("/contact", submitContact);

// Admin/moderator contact management (protected routes)
router.get("/admin/contacts", jwtAuth, getAllContacts);
router.get("/admin/contacts/stats", jwtAuth, getContactStats);
router.get("/admin/contacts/:id", jwtAuth, getContactById);
router.put("/admin/contacts/:id/status", jwtAuth, updateContactStatus);
router.post("/admin/contacts/:id/notes", jwtAuth, addContactNote);
router.delete("/admin/contacts/:id", jwtAuth, deleteContact);

// ===== LEGACY ROUTES (for backward compatibility) =====
// These routes maintain compatibility with existing frontend code
router.get("/profile/:id", getUserProfile);
router.patch("/mapPrivacy/:id/privacy", jwtAuth, toggleMapPrivacy);
router.get("/dashboard/:id", jwtAuth, getUserDashboard);
router.post("/mymaps", jwtAuth, validateMapData, createMap);
router.get("/map/:id", getMap);

module.exports = router;
