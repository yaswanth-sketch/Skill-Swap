const express = require('express');
const router = express.Router();
const { getSkills, getSkill, createSkill, updateSkill, deleteSkill, getCategories, getTags } = require('../controllers/skillController');
const { auth } = require('../middleware/auth');

router.get('/', getSkills);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/:id', getSkill);
router.post('/', auth, createSkill);
router.put('/:id', auth, updateSkill);
router.delete('/:id', auth, deleteSkill);

module.exports = router;
