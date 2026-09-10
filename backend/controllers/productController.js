// backend/controllers/productController.js
import { getAllProductsWithStats } from '../models/productModel.js'

export async function listProducts(req, res, next) {
  try {
    const products = await getAllProductsWithStats()
    res.status(200).json({ products })
  } catch (err) {
    next(err)
  }
}