const express = require("express");
const router = express.Router();

// Import controllers
const {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
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
  searchPOIsByLocation,
  searchPOIsByName,
  searchMapsByPOIName,
  togglePOILike,
  getPopularLocations,
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

const { jwtAuth } = require("../helpers/jwtAuth");
const {
  validateRegistration,
  validateLogin,
  validateMapData,
} = require("../middleware/validation");
const { upload } = require("../services/s3Service");
const { upload: profileUpload } = require("../services/profilePictureService");

// ===== AUTHENTICATION ROUTES =====
router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/verifyUser", verifyUser);

// ===== USER ROUTES =====
router.get("/users/profile/:id", getUserProfile);
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
router.post("/maps", jwtAuth, validateMapData, createMap);
router.get("/maps/search", searchMaps);
router.get("/maps/popular", getPopularMaps);
router.get("/maps/:id", getMap);
router.get("/users/:userId/maps", getUserMaps);
router.put("/maps/:id", jwtAuth, updateMap);
router.delete("/maps/:id", jwtAuth, deleteMap);
router.patch("/maps/:id/privacy", jwtAuth, toggleMapPrivacy);
router.post("/maps/:id/like", jwtAuth, toggleMapLike);

// ===== POI ROUTES =====
router.post("/pois", jwtAuth, createPOI);
router.get("/pois/user", jwtAuth, getUserPOIs);
router.get("/pois/search/location", searchPOIsByLocation);
router.get("/pois/search/name", searchPOIsByName);
router.get("/pois/search/maps/:poiName", searchMapsByPOIName);
router.get("/pois/popular-locations", getPopularLocations);
router.get("/pois/:id", getPOI);
router.put("/pois/:id", jwtAuth, updatePOI);
router.delete("/pois/:id", jwtAuth, deletePOI);
router.get("/maps/:mapId/pois", getPOIsByMap);
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

// ===== LEGACY ROUTES (for backward compatibility) =====
// These routes maintain compatibility with existing frontend code
router.get("/profile/:id", getUserProfile);
router.patch("/mapPrivacy/:id/privacy", jwtAuth, toggleMapPrivacy);
router.get("/dashboard/:id", jwtAuth, getUserDashboard);
router.post("/mymaps", jwtAuth, validateMapData, createMap);
router.get("/map/:id", getMap);

module.exports = router;
