import type { Products } from '../../models/product'
import ProductService from '../../services/product.services'
import { defineStore } from 'pinia'

interface ProductState {
  products: Products
  partners: Products
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    partners: []
  }),
  actions: {
    async syncProducts () {
      const response = await ProductService.getAllProducts()
      if (response?.data) {
        this.products = response.data?.sort((a, b) => a.name.localeCompare(b.name))
      }
    }
  }
})
