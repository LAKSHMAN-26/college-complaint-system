const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getComments,
  addComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getComments);
router.post('/', protect, upload.array('attachments', 3), addComment);

module.exports = router;
