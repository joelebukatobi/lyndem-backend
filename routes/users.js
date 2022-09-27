const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser, userPhotoUpload } = require('../controllers/users');

const User = require('../models/User');
const filterResults = require('../middleware/filter');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(filterResults(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

router.route('/:id/photo').put(userPhotoUpload);

module.exports = router;
