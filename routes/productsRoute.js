const router = require('express').Router()
const { productsController } = require('../controllers')

router.get('/', productsController.getData);
router.get('/getcategory', productsController.getCategory);

router.patch('/:id', productsController.editProducts);

module.exports = router;