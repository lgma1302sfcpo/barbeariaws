import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { fallbackProducts } from '../data/fallbackProducts.js'
import { maxProductQuantity, openCartMenu, readCart, setProductQuantity } from '../lib/cart.js'

function formatCurrency(cents, currency = 'brl') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json().catch(() => ({}))

        if (!response.ok) throw new Error(data.error || 'Produto nao encontrado.')

        setProduct(data)
        const cartQuantity = Number(readCart()[data.id] || 0)
        setQuantity(cartQuantity > 0 ? cartQuantity : 1)
      } catch (loadError) {
        const fallbackProduct = fallbackProducts.find((candidate) => candidate.id === productId)

        if (fallbackProduct) {
          setProduct(fallbackProduct)
          const cartQuantity = Number(readCart()[fallbackProduct.id] || 0)
          setQuantity(cartQuantity > 0 ? cartQuantity : 1)
        } else {
          setError(loadError.message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const updateQuantity = (value) => {
    if (!product) return

    const nextQuantity = Math.max(1, Math.min(maxProductQuantity(product), Number(value) || 1))
    setQuantity(nextQuantity)
  }

  const addToCart = () => {
    if (!product) return

    if (maxProductQuantity(product) <= 0) {
      setError('Produto sem estoque disponivel.')
      return
    }

    setProductQuantity(product, quantity)
    openCartMenu()
    setMessage('Produto adicionado ao carrinho.')
    setError('')
  }

  const buyNow = () => {
    addToCart()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink-950 px-5 py-24 text-white">
        <div className="section-shell flex min-h-96 items-center justify-center text-zinc-300">
          <Loader2 className="mr-2 animate-spin text-gold-300" size={20} />
          Carregando produto
        </div>
      </main>
    )
  }

  if (error && !product) {
    return (
      <main className="min-h-screen bg-ink-950 px-5 py-24 text-white">
        <div className="section-shell">
          <a href="/#produtos" className="btn-secondary">
            <ArrowLeft size={18} />
            Voltar aos produtos
          </a>
          <div className="premium-card mt-8 p-6 text-red-100">{error}</div>
        </div>
      </main>
    )
  }

  const maxQuantity = maxProductQuantity(product)
  const soldOut = maxQuantity <= 0

  return (
    <main className="min-h-screen bg-ink-950 pt-24 text-white">
      <section className="section-padding">
        <div className="section-shell">
          <a href="/#produtos" className="btn-secondary">
            <ArrowLeft size={18} />
            Voltar aos produtos
          </a>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div className="premium-card overflow-hidden">
              <img src={product.image} alt={product.name} className="max-h-[680px] w-full object-cover" />
            </div>

            <div className="premium-card p-6 lg:p-8">
              <p className="section-eyebrow">Produto</p>
              <h1 className="text-3xl font-black text-white sm:text-5xl">{product.name}</h1>
              <p className="mt-5 text-base leading-7 text-zinc-300">{product.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-md border border-gold-300/35 bg-gold-300/10 px-4 py-3 text-2xl font-black text-gold-100">
                  {formatCurrency(product.priceCents, product.currency)}
                </span>
                {product.stock !== null && product.stock !== undefined && (
                  <span className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-zinc-300">
                    {product.stock > 0 ? `${product.stock} em estoque` : 'Produto esgotado'}
                  </span>
                )}
              </div>

              <div className="mt-8">
                <p className="mb-2 text-sm font-bold text-zinc-300">Quantidade</p>
                <div className="grid max-w-72 grid-cols-[52px_1fr_52px] overflow-hidden rounded-md border border-white/10 bg-black/25">
                  <button
                    type="button"
                    className="flex h-12 items-center justify-center text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={soldOut || quantity <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    disabled={soldOut}
                    onChange={(event) => updateQuantity(event.target.value)}
                    className="h-12 border-x border-white/10 bg-transparent text-center text-sm font-black text-white outline-none"
                  />
                  <button
                    type="button"
                    className="flex h-12 items-center justify-center text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={soldOut || quantity >= maxQuantity}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" className="btn-primary" onClick={addToCart} disabled={soldOut}>
                  <ShoppingCart size={18} />
                  Adicionar ao carrinho
                </button>
                <button type="button" className="btn-secondary" onClick={buyNow} disabled={soldOut}>
                  Comprar agora
                </button>
              </div>

              {message && (
                <p className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  {message}
                </p>
              )}

              {error && (
                <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
