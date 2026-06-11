import { useEffect, useState } from 'react'
import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react'
import {
  addProductToCart,
  cartEventName,
  maxProductQuantity,
  openCartMenu,
  readCart,
  setProductQuantity,
} from '../lib/cart.js'
import { fallbackProducts } from '../data/fallbackProducts.js'
import { apiUrl, readApiJson } from '../lib/api.js'

function formatCurrency(cents, currency = 'brl') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState(() => readCart())
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(apiUrl('/api/products'))
        if (!response.ok) throw new Error('Não foi possível carregar os produtos.')

        const data = await readApiJson(response, 'Não foi possível carregar os produtos.')
        setProducts(data.length > 0 ? data : fallbackProducts)
      } catch {
        setProducts(fallbackProducts)
        if (import.meta.env.DEV) {
          setError('Serviço indisponível. Exibindo produto de exemplo no ambiente de desenvolvimento.')
        }
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const syncCart = () => setQuantities(readCart())

    window.addEventListener(cartEventName, syncCart)
    window.addEventListener('storage', syncCart)

    return () => {
      window.removeEventListener(cartEventName, syncCart)
      window.removeEventListener('storage', syncCart)
    }
  }, [])

  const updateQuantity = (product, value) => {
    setProductQuantity(product, value)
    setMessage('')
    setError('')
  }

  const addToCart = (product) => {
    const maxQuantity = maxProductQuantity(product)
    const current = Number(quantities[product.id] || 0)

    if (maxQuantity <= 0) {
      setError('Produto sem estoque disponível.')
      return
    }

    if (current <= 0) {
      addProductToCart(product)
    }

    openCartMenu()
    setMessage(`${product.name} adicionado ao carrinho.`)
    setError('')
  }

  return (
    <section id="produtos" className="section-padding bg-ink-900">
      <div className="section-shell">
        <div data-reveal>
          <p className="section-eyebrow">Produtos</p>
          <h2 className="section-title">Produtos para manter o visual em dia.</h2>
          <p className="section-copy">
            Escolha seus produtos, confira as opções de entrega e finalize o pedido com segurança.
          </p>
        </div>

        {message && (
          <p className="mt-6 max-w-2xl rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 max-w-2xl rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-reveal>
          {loadingProducts ? (
            <div className="premium-card flex min-h-64 items-center justify-center p-6 text-zinc-300 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <Loader2 className="mr-2 animate-spin text-gold-300" size={20} />
              Carregando produtos
            </div>
          ) : (
            products.map((product) => {
              const quantity = Number(quantities[product.id] || 0)
              const maxQuantity = maxProductQuantity(product)
              const soldOut = maxQuantity <= 0

              return (
                <article key={product.id} className="premium-card overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-gold-300/35">
                  <a href={`/produto/${product.id}`} className="block">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-56 w-full object-cover"
                      loading="lazy"
                    />
                  </a>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <a href={`/produto/${product.id}`} className="transition hover:text-gold-100">
                          <h3 className="text-xl font-black text-white">{product.name}</h3>
                        </a>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">{product.description}</p>
                        {product.stock !== null && product.stock !== undefined && (
                          <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                            {product.stock > 0 ? `Estoque: ${product.stock}` : 'Produto esgotado'}
                          </p>
                        )}
                      </div>
                      <span className="rounded-md border border-gold-300/35 bg-gold-300/10 px-3 py-2 text-sm font-black text-gold-100">
                        {formatCurrency(product.priceCents, product.currency)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-[44px_1fr_44px] overflow-hidden rounded-md border border-white/10 bg-black/25">
                      <button
                        type="button"
                        className="flex h-11 items-center justify-center text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                        onClick={() => updateQuantity(product, quantity - 1)}
                        disabled={quantity <= 0}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={maxQuantity}
                        disabled={soldOut}
                        value={quantity}
                        onChange={(event) => updateQuantity(product, event.target.value)}
                        className="h-11 border-x border-white/10 bg-transparent text-center text-sm font-black text-white outline-none"
                        aria-label={`Quantidade de ${product.name}`}
                      />
                      <button
                        type="button"
                        className="flex h-11 items-center justify-center text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                        onClick={() => updateQuantity(product, quantity + 1)}
                        disabled={soldOut || quantity >= maxQuantity}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          className="btn-primary px-3"
                          onClick={() => addToCart(product)}
                          disabled={soldOut}
                        >
                        <ShoppingCart size={18} />
                        Adicionar
                      </button>
                      <a href={`/produto/${product.id}`} className="btn-secondary px-3">
                        Ver produto
                      </a>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
