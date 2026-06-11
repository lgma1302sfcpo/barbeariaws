import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, CreditCard, Loader2, QrCode, ShoppingCart, Trash2, Truck, X } from 'lucide-react'
import { fallbackProducts } from '../data/fallbackProducts.js'
import { apiUrl, readApiJson } from '../lib/api.js'
import { authHeaders, readAuth } from '../lib/auth.js'
import { cartEventName, cartOpenEventName, clearCart, readCart, setProductQuantity } from '../lib/cart.js'

const defaultCep = '11700-120'

function formatCurrency(cents, currency = 'brl') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function checkoutErrorMessage(message) {
  const text = String(message || '')
  if (/stripe|secret|checkout|invalid url/i.test(text)) {
    return 'Não foi possível abrir o pagamento agora. Tente novamente em instantes.'
  }

  return text || 'Não foi possível abrir o pagamento agora. Tente novamente em instantes.'
}

export default function HeaderCart({ homeHref, mode = 'desktop', onNavigate, buttonClassName = 'btn-secondary px-4' }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState(() => readCart())
  const [products, setProducts] = useState([])
  const [cep, setCep] = useState(defaultCep)
  const [freightOptions, setFreightOptions] = useState([])
  const [selectedFreight, setSelectedFreight] = useState('')
  const [calculatingFreight, setCalculatingFreight] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [creatingPix, setCreatingPix] = useState(false)
  const [error, setError] = useState('')
  const [freightWarning, setFreightWarning] = useState('')
  const [pixPayment, setPixPayment] = useState(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixStatus, setPixStatus] = useState('')
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(apiUrl('/api/products'))
        if (!response.ok) throw new Error('Não foi possível carregar os produtos.')
        const data = await readApiJson(response, 'Não foi possível carregar os produtos.')
        setProducts(data.length > 0 ? data : fallbackProducts)
      } catch {
        setProducts(fallbackProducts)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    const syncCart = () => {
      setCart(readCart())
      setFreightOptions([])
      setSelectedFreight('')
      setPixPayment(null)
      setPixCopied(false)
      setPixStatus('')
    }
    const openCart = () => setCartOpen(true)

    window.addEventListener(cartEventName, syncCart)
    window.addEventListener('storage', syncCart)
    window.addEventListener(cartOpenEventName, openCart)

    return () => {
      window.removeEventListener(cartEventName, syncCart)
      window.removeEventListener('storage', syncCart)
      window.removeEventListener(cartOpenEventName, openCart)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', cartOpen)

    if (cartOpen) {
      previousFocusRef.current = document.activeElement
      window.requestAnimationFrame(() => panelRef.current?.focus())
    } else {
      previousFocusRef.current?.focus?.()
    }

    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [cartOpen])

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([productId, quantity]) => {
          const product = products.find((candidate) => candidate.id === productId)
          return product ? { product, productId, quantity: Number(quantity) } : null
        })
        .filter(Boolean),
    [cart, products],
  )

  const cartItemsKey = cartItems.map((item) => `${item.productId}:${item.quantity}`).join('|')
  const panelVisible = cartOpen
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const subtotalCents = cartItems.reduce((total, item) => total + item.product.priceCents * item.quantity, 0)
  const selectedFreightOption = freightOptions.find((option) => option.id === selectedFreight)
  const totalCents = subtotalCents + (selectedFreightOption?.amountCents || 0)

  const calculateFreight = async () => {
    setError('')
    setPixPayment(null)
    setPixCopied(false)
    setPixStatus('')

    if (cartItems.length === 0) return

    if (cep.replace(/\D/g, '').length !== 8) {
      setError('Informe um CEP válido.')
      return
    }

    setCalculatingFreight(true)
    setFreightWarning('')
    try {
      const response = await fetch(apiUrl('/api/freight'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep,
          items: cartItems.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
      })

      const data = await readApiJson(response, 'Não foi possível calcular o frete.')
      if (!response.ok) throw new Error(data.error || 'Não foi possível calcular o frete.')

      setFreightOptions(data.options)
      setSelectedFreight(data.options[0]?.id || '')
      setFreightWarning(data.providerWarning || '')
    } catch (freightError) {
      setError(freightError.message)
    } finally {
      setCalculatingFreight(false)
    }
  }

  useEffect(() => {
    if (!panelVisible || cartItems.length === 0) return undefined

    const timeoutId = window.setTimeout(() => {
      calculateFreight()
    }, 250)

    return () => window.clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelVisible, cartItemsKey, cep])

  useEffect(() => {
    if (!pixPayment?.orderId || pixStatus === 'PAID') return undefined

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(apiUrl(`/api/orders/${pixPayment.orderId}/status`))
        const data = await readApiJson(response, 'Não foi possível consultar o pagamento.')
        if (data.paymentStatus === 'PAID') {
          setPixStatus('PAID')
          clearCart()
        }
      } catch {
        // Keep the Pix visible while the webhook/status request catches up.
      }
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [pixPayment?.orderId, pixStatus])

  const checkout = async () => {
    setError('')

    if (!selectedFreight) {
      setError('Escolha uma opção de entrega antes de continuar.')
      return
    }

    setCheckingOut(true)
    try {
      const auth = readAuth()
      const customer = auth.user
        ? {
            ...(auth.user.name ? { name: auth.user.name } : {}),
            ...(auth.user.email ? { email: auth.user.email } : {}),
            ...(auth.user.phone ? { phone: auth.user.phone } : {}),
          }
        : undefined
      const response = await fetch(apiUrl('/api/checkout'), {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          cep,
          items: cartItems.map(({ productId, quantity }) => ({ productId, quantity })),
          freightOptionId: selectedFreight,
          customer,
        }),
      })

      const data = await readApiJson(response, 'Não foi possível iniciar o pagamento.')
      if (!response.ok) throw new Error(data.error || 'Não foi possível abrir o pagamento. Tente novamente.')

      window.location.href = data.url
    } catch (checkoutError) {
      setError(checkoutErrorMessage(checkoutError.message))
    } finally {
      setCheckingOut(false)
    }
  }

  const createPixPayment = async () => {
    setError('')
    setPixCopied(false)

    if (!selectedFreight) {
      setError('Escolha uma opção de entrega antes de continuar.')
      return
    }

    setCreatingPix(true)
    try {
      const auth = readAuth()
      const customer = auth.user
        ? {
            ...(auth.user.name ? { name: auth.user.name } : {}),
            ...(auth.user.email ? { email: auth.user.email } : {}),
            ...(auth.user.phone ? { phone: auth.user.phone } : {}),
          }
        : undefined
      const response = await fetch(apiUrl('/api/pix/checkout'), {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          cep,
          items: cartItems.map(({ productId, quantity }) => ({ productId, quantity })),
          freightOptionId: selectedFreight,
          customer,
        }),
      })

      const data = await readApiJson(response, 'Não foi possível gerar o Pix.')
      if (!response.ok) throw new Error(data.error || 'Não foi possível gerar o Pix.')

      setPixPayment(data)
      setPixStatus('PENDING')
    } catch (pixError) {
      setError(pixError.message)
    } finally {
      setCreatingPix(false)
    }
  }

  const copyPixCode = async () => {
    if (!pixPayment?.qrCode) return

    await navigator.clipboard.writeText(pixPayment.qrCode)
    setPixCopied(true)
  }

  const handlePanelKeyDown = (event) => {
    if (event.key === 'Escape') {
      setCartOpen(false)
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(
      panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [],
    ).filter((element) => element.offsetParent !== null)

    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const panel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <p id={`cart-title-${mode}`} className="inline-flex items-center gap-2 text-base font-black text-white">
          <ShoppingCart size={18} />
          Carrinho
        </p>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gold-300 px-2 py-0.5 text-xs font-black text-black">{cartCount}</span>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:border-gold-300/45"
            onClick={() => setCartOpen(false)}
            aria-label="Fechar carrinho"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 gallery-scrollbar">
        <div className="space-y-3">
          {cartItems.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
              Nenhum produto adicionado.
            </p>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 rounded-md border border-white/10 bg-black/25 p-3">
                <img src={product.image} alt={product.name} className="h-14 w-14 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {quantity}x {formatCurrency(product.priceCents, product.currency)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-zinc-500 transition hover:text-red-100"
                  onClick={() => setProductQuantity(product, 0)}
                  aria-label={`Remover ${product.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <label className="mt-5 block text-xs font-bold text-zinc-300">
            CEP para retirada ou entrega
            <input
              value={cep}
              onChange={(event) => {
                setCep(event.target.value)
                setFreightOptions([])
                setSelectedFreight('')
                setPixPayment(null)
                setPixCopied(false)
                setPixStatus('')
              }}
              placeholder="00000-000"
              inputMode="numeric"
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition focus:border-gold-300"
            />
          </label>
        )}

        {cartItems.length === 0 && pixStatus !== 'PAID' && (
          <a href={homeHref('#produtos')} className="btn-secondary mt-4 w-full" onClick={() => {
            setCartOpen(false)
            onNavigate?.()
          }}>
            Ver produtos
          </a>
        )}
      </div>

      {(cartItems.length > 0 || pixPayment) && (
        <div className="border-t border-white/10 p-5">
          {cartItems.length > 0 && (
            <div className="mt-3 space-y-2">
              {calculatingFreight ? (
                <p className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <Loader2 className="animate-spin text-gold-300" size={15} />
                  Calculando frete
                </p>
              ) : freightOptions.length > 0 ? (
                freightOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer gap-2 rounded-md border border-white/10 bg-black/25 p-2 transition hover:border-gold-300/45"
                  >
                    <input
                      type="radio"
                      name={`header-freight-${mode}`}
                      checked={selectedFreight === option.id}
                      onChange={() => setSelectedFreight(option.id)}
                      className="mt-1 accent-gold-300"
                    />
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2 text-xs font-black text-white">
                        {option.label}
                        <span className="text-gold-100">{formatCurrency(option.amountCents, option.currency)}</span>
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-zinc-400">{option.deliveryEstimate}</span>
                    </span>
                  </label>
                ))
              ) : (
                <button type="button" className="btn-secondary min-h-10 w-full py-2 text-xs" onClick={calculateFreight}>
                  <Truck size={16} />
                  Calcular frete
                </button>
              )}
            </div>
          )}

          {freightWarning && freightOptions.some((option) => option.type === 'fallback_shipping') && (
            <p className="mt-2 rounded-md border border-amber-300/30 bg-amber-500/10 p-2 text-[11px] leading-4 text-amber-100">
              Cotação automática indisponível no momento. Exibimos uma estimativa para você continuar.
            </p>
          )}

          {cartItems.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Produtos</span>
                <span>{formatCurrency(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Frete</span>
                <span>{formatCurrency(selectedFreightOption?.amountCents || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-white">
                <span>Total</span>
                <span>{formatCurrency(totalCents)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-md border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-100">
              {error}
            </p>
          )}

          {pixPayment && (
            <div className="mt-4 overflow-hidden rounded-lg border border-gold-300/25 bg-black/35">
              <div className="border-b border-white/10 bg-gold-500/10 p-3">
                <p className="inline-flex items-center gap-2 text-sm font-black text-white">
                  <QrCode size={16} className="text-gold-300" />
                  {pixStatus === 'PAID' ? 'Pagamento confirmado' : 'Pix gerado'}
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-300">
                  {pixStatus === 'PAID'
                    ? 'Recebemos seu pagamento. Seu pedido já foi registrado.'
                    : 'Escaneie o QR Code ou copie o código abaixo no app do seu banco.'}
                </p>
              </div>

              {pixStatus === 'PAID' ? (
                <div className="p-4 text-center">
                  <p className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-100">
                    Pedido pago com sucesso.
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  {pixPayment.qrCodeImage && (
                    <img
                      src={pixPayment.qrCodeImage}
                      alt="QR Code Pix"
                      className="mx-auto h-48 w-48 rounded-lg bg-white p-2 shadow-lg"
                    />
                  )}
                  <button
                    type="button"
                    className="btn-secondary mt-4 min-h-10 w-full py-2 text-xs"
                    onClick={copyPixCode}
                  >
                    <Copy size={15} />
                    {pixCopied ? 'Código copiado' : 'Copiar Pix copia e cola'}
                  </button>
                  <p className="mt-2 text-center text-[11px] leading-4 text-zinc-400">
                    Válido por {Math.round((pixPayment.expiresSeconds || 1800) / 60)} minutos. A tela atualiza automaticamente após a confirmação.
                  </p>
                </div>
              )}
            </div>
          )}

          {cartItems.length > 0 && (
            <>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={checkout}
                disabled={checkingOut || creatingPix || calculatingFreight || !selectedFreight || pixStatus === 'PAID'}
              >
                {checkingOut ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                Pagar com cartão
              </button>

              <button
                type="button"
                className="btn-secondary mt-3 w-full"
                onClick={createPixPayment}
                disabled={checkingOut || creatingPix || calculatingFreight || !selectedFreight || pixStatus === 'PAID'}
              >
                {creatingPix ? <Loader2 className="animate-spin" size={18} /> : <QrCode size={18} />}
                Pagar com Pix
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={buttonClassName}
        onClick={() => setCartOpen((value) => !value)}
        aria-expanded={cartOpen}
        aria-controls={`cart-panel-${mode}`}
      >
        <ShoppingCart size={18} />
        Carrinho
        {cartCount > 0 && (
          <span className="ml-1 rounded-full bg-gold-300 px-2 py-0.5 text-xs font-black text-black">{cartCount}</span>
        )}
      </button>
      <div
        className={`fixed inset-0 z-[80] bg-black/65 backdrop-blur-md transition-all duration-300 ${
          cartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        id={`cart-panel-${mode}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`cart-title-${mode}`}
        aria-hidden={!cartOpen}
        inert={cartOpen ? undefined : ''}
        tabIndex={-1}
        className={`fixed right-0 top-0 z-[90] h-dvh w-full max-w-md border-l border-white/10 bg-ink-950 shadow-2xl transition-transform duration-300 ease-out sm:w-[440px] ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onKeyDown={handlePanelKeyDown}
      >
        {panel}
      </aside>
    </>
  )
}
