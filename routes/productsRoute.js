const router = require('express').Router()
const { productsController } = require('../controllers')

router.get('/', productsController.getData);
router.get('/getcategory', productsController.getCategory);

router.post('/', productsController.addProducts)
router.patch('/:id', productsController.editProducts);
router.delete('/:id', productsController.deleteProducts);

module.exports = router;