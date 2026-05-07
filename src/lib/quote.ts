export interface Company {
  id: string
  name: string
  brandName?: string
  address: string
  ico: string
  dic?: string
  email?: string
  phone?: string
  website?: string
}

export interface QuoteOption {
  id: string
  title: string
  price: number
  priceLabel: string        // 'bez DPH' | 's DPH'
  paymentTerms?: string
  deliveryTime?: string
  includes: string[]        // bullet points
}

export interface SavedQuote {
  id: string
  createdAt: string
  supplierName: string
  clientName: string
  intro: string
  options: QuoteOption[]
  html: string
}
