import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  LogIn,
  LogOut,
  PackagePlus,
  Pencil,
  Save,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { apiUrl, readApiJson } from '../lib/api.js'
import { authHeaders, clearAuth, readAuth, writeAuth } from '../lib/auth.js'
import { clearCart } from '../lib/cart.js'

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  image: '/assets/products/produto.webp',
  stripePriceId: '',
  weightKg: '0.3',
  width: '8',
  height: '8',
  length: '12',
  stock: '',
  active: true,
}

function centsToPrice(cents) {
  return String((Number(cents || 0) / 100).toFixed(2)).replace('.', ',')
}

function formatCurrency(cents, currency = 'brl') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(Number(cents || 0) / 100)
}

function formatDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function priceToCents(value) {
  return Math.round(Number(String(value).replace(',', '.')) * 100)
}

const statusOptions = [
  ['PENDING', 'Pendente'],
  ['PAID', 'Pago'],
  ['PREPARING', 'Preparando'],
  ['READY_FOR_PICKUP', 'Pronto para retirada'],
  ['SHIPPED', 'Enviado'],
  ['DELIVERED', 'Entregue'],
  ['CANCELED', 'Cancelado'],
]

const paymentLabels = {
  UNPAID: 'Não pago',
  PAID: 'Pago',
  FAILED: 'Falhou',
  REFUNDED: 'Reembolsado',
}

function productToForm(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    price: centsToPrice(product.priceCents),
    image: product.image || '/assets/products/produto.webp',
    stripePriceId: product.stripePriceId || '',
    weightKg: String(product.weightKg || '0.3'),
    width: String(product.dimensionsCm?.width || '8'),
    height: String(product.dimensionsCm?.height || '8'),
    length: String(product.dimensionsCm?.length || '12'),
    stock: product.stock === null || product.stock === undefined ? '' : String(product.stock),
    active: product.active !== false,
  }
}

function formToPayload(form) {
  return {
    name: form.name,
    description: form.description,
    priceCents: priceToCents(form.price),
    currency: 'brl',
    image: form.image,
    stripePriceId: form.stripePriceId,
    active: form.active,
    stock: form.stock === '' ? null : Number(form.stock),
    weightKg: Number(String(form.weightKg).replace(',', '.')),
    dimensionsCm: {
      width: Number(String(form.width).replace(',', '.')),
      height: Number(String(form.height).replace(',', '.')),
      length: Number(String(form.length).replace(',', '.')),
    },
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

function ProductFields({ form, setForm, uploadingImage, onImageSelect }) {
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <label className="text-sm font-bold text-zinc-300">
        Nome
        <input
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
          placeholder="Pomada modeladora"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      <label className="text-sm font-bold text-zinc-300">
        Preco
        <input
          value={form.price}
          onChange={(event) => setField('price', event.target.value)}
          placeholder="39,90"
          inputMode="decimal"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      <label className="text-sm font-bold text-zinc-300 lg:col-span-2">
        Imagem do produto
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onImageSelect}
          disabled={uploadingImage}
          className="mt-2 block w-full rounded-md border border-white/10 bg-black/35 px-3 py-3 text-sm text-zinc-300 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-gold-300 file:px-3 file:py-2 file:text-sm file:font-black file:text-black hover:border-gold-300/45 focus:border-gold-300"
        />
        <span className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          {uploadingImage ? <Loader2 className="animate-spin text-gold-300" size={14} /> : <ImagePlus size={14} />}
          No computador abre o diretorio. No celular abre a galeria.
        </span>
      </label>

      <label className="text-sm font-bold text-zinc-300 lg:col-span-2">
        Caminho da imagem
        <input
          value={form.image}
          onChange={(event) => setField('image', event.target.value)}
          placeholder="/assets/products/produto.webp"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      <label className="text-sm font-bold text-zinc-300 lg:col-span-2">
        Descrição
        <input
          value={form.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="Descrição curta do produto"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      <label className="text-sm font-bold text-zinc-300">
        Peso kg
        <input
          value={form.weightKg}
          onChange={(event) => setField('weightKg', event.target.value)}
          inputMode="decimal"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      <label className="text-sm font-bold text-zinc-300">
        Stripe Price ID
        <input
          value={form.stripePriceId}
          onChange={(event) => setField('stripePriceId', event.target.value)}
          placeholder="Opcional"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      {[
        ['width', 'Largura cm'],
        ['height', 'Altura cm'],
        ['length', 'Comprimento cm'],
      ].map(([field, label]) => (
        <label key={field} className="text-sm font-bold text-zinc-300">
          {label}
          <input
            value={form[field]}
            onChange={(event) => setField(field, event.target.value)}
            inputMode="decimal"
            className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
          />
        </label>
      ))}

      <label className="text-sm font-bold text-zinc-300">
        Estoque
        <input
          value={form.stock}
          onChange={(event) => setField('stock', event.target.value)}
          placeholder="Opcional"
          inputMode="numeric"
          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
        />
      </label>

      <label className="flex min-h-12 items-center gap-3 rounded-md border border-white/10 bg-black/25 px-3 text-sm font-bold text-zinc-200 lg:mt-7">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => setField('active', event.target.checked)}
          className="accent-gold-300"
        />
        Produto ativo
      </label>
    </div>
  )
}

export default function Admin() {
  const [auth, setAuth] = useState(() => readAuth())
  const [loginForm, setLoginForm] = useState({ email: 'barbershopws13@gmail.com', password: '' })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingOrderId, setSavingOrderId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isEditing = Boolean(editingId)
  const isAdmin = auth.user?.role === 'ADMIN'

  const activeCount = useMemo(() => products.filter((product) => product.active !== false).length, [products])

  const loadAdminData = async () => {
    setError('')
    setMessage('')

    if (!isAdmin) {
      setError('Entre com uma conta administrativa.')
      return
    }

    setLoading(true)
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch(apiUrl('/api/admin/products'), { headers: authHeaders() }),
        fetch(apiUrl('/api/admin/orders'), { headers: authHeaders() }),
      ])

      const productsData = await readApiJson(productsResponse, 'Não foi possível carregar os produtos.').catch(() => [])
      const ordersData = await readApiJson(ordersResponse, 'Não foi possível carregar os pedidos.').catch(() => [])

      if (!productsResponse.ok) throw new Error(productsData.error || 'Não foi possível carregar os produtos.')
      if (!ordersResponse.ok) throw new Error(ordersData.error || 'Não foi possível carregar os pedidos.')

      setProducts(productsData)
      setOrders(ordersData)
      setMessage('Admin carregado.')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const resetForm = () => {
    setEditingId('')
    setForm(emptyProduct)
  }

  const loginAdmin = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })

      const data = await readApiJson(response, 'Não foi possível entrar.').catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.')
      if (data.user?.role !== 'ADMIN') throw new Error('Essa conta não tem permissão administrativa.')

      writeAuth(data)
      setAuth(data)
      setMessage('Admin conectado.')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadProductImage = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError('')
    setMessage('')

    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem.')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 8 MB.')
      return
    }

    setUploadingImage(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const response = await fetch(apiUrl('/api/admin/uploads/product-image'), {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      })

      const data = await readApiJson(response, 'Não foi possível enviar a imagem.').catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar a imagem.')

      setForm((current) => ({ ...current, image: data.url }))
      setMessage('Imagem carregada. Agora salve o produto.')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isAdmin) {
      setError('Entre com uma conta administrativa.')
      return
    }

    if (!form.name.trim() || !priceToCents(form.price)) {
      setError('Nome e preco sao obrigatorios.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(apiUrl(isEditing ? `/api/admin/products/${editingId}` : '/api/admin/products'), {
        method: isEditing ? 'PUT' : 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(formToPayload(form)),
      })

      const data = await readApiJson(response, 'Não foi possível salvar o produto.').catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o produto.')

      if (isEditing) {
        setProducts((current) => current.map((product) => (product.id === editingId ? data : product)))
        setMessage('Produto atualizado.')
      } else {
        setProducts((current) => [...current, data])
        setMessage('Produto cadastrado.')
      }

      resetForm()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const editProduct = (product) => {
    setEditingId(product.id)
    setForm(productToForm(product))
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(`Desativar o produto "${product.name}"?`)
    if (!confirmed) return

    setError('')
    setMessage('')
    try {
      const response = await fetch(apiUrl(`/api/admin/products/${product.id}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })

      if (!response.ok) {
        const data = await readApiJson(response, 'Não foi possível desativar o produto.').catch(() => ({}))
        throw new Error(data.error || 'Não foi possível desativar o produto.')
      }

      setProducts((current) =>
        current.map((candidate) => (candidate.id === product.id ? { ...candidate, active: false } : candidate)),
      )
      setMessage('Produto desativado.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const logout = () => {
    clearAuth()
    clearCart()
    setAuth({})
    setProducts([])
    setOrders([])
    resetForm()
    setMessage('')
    setError('')
  }

  const updateOrder = async (orderId, status) => {
    setError('')
    setMessage('')
    setSavingOrderId(orderId)

    try {
      const response = await fetch(apiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status }),
      })

      const data = await readApiJson(response, 'Não foi possível atualizar o pedido.').catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar o pedido.')

      setOrders((current) => current.map((order) => (order.id === orderId ? data : order)))
      setMessage('Pedido atualizado.')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSavingOrderId('')
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-ink-950 px-5 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center">
          <section className="premium-card w-full p-6 lg:p-8">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-300/25 bg-gold-300/10 text-gold-300">
              <LogIn size={24} />
            </div>
            <p className="section-eyebrow">Admin</p>
            <h1 className="mt-2 text-3xl font-black">Entrar no painel</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Use a conta administrativa para cadastrar produtos, enviar imagens e acompanhar pedidos.
            </p>

            <form className="mt-6 space-y-4" onSubmit={loginAdmin}>
              <label className="block text-sm font-bold text-zinc-300">
                E-mail
                <input
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  placeholder="barbershopws13@gmail.com"
                  className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                />
              </label>

              <label className="block text-sm font-bold text-zinc-300">
                Senha
                <input
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  placeholder="Senha do admin"
                  className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                />
              </label>

              {error && (
                <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </p>
              )}
              {message && (
                <p className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  {message}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
                Entrar como admin
              </button>
            </form>

            <a href="/" className="btn-secondary mt-4 w-full">
              Voltar para o site
            </a>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ink-950 px-5 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="section-eyebrow">Admin</p>
            <h1 className="text-3xl font-black sm:text-4xl">Admin da barbearia</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              Cadastre produtos, acompanhe entregas e gerencie os pedidos da loja.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-zinc-200">
              {auth.user?.name || 'Admin'}
            </div>
            <a href="/" className="btn-secondary">
              Ver site
            </a>
            <button type="button" className="btn-secondary" onClick={logout}>
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="premium-card h-fit p-6">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-300/25 bg-gold-300/10 text-gold-300">
              <PackagePlus size={24} />
            </div>
            <h2 className="text-2xl font-black">{isEditing ? 'Editar produto' : 'Adicionar produto'}</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn-secondary" onClick={loadAdminData} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Atualizar dados
              </button>
              {isEditing && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar edicao
                </button>
              )}
            </div>

            <form className="mt-6" onSubmit={saveProduct}>
              <ProductFields
                form={form}
                setForm={setForm}
                uploadingImage={uploadingImage}
                onImageSelect={uploadProductImage}
              />

              <button type="submit" className="btn-primary mt-5 w-full" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                {error}
              </p>
            )}
            {message && (
              <p className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                {message}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="section-eyebrow">Catalogo</p>
                <h2 className="text-2xl font-black">{activeCount} produtos ativos</h2>
              </div>
              <button type="button" className="btn-secondary" onClick={loadAdminData} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                Atualizar
              </button>
            </div>

            <div className="grid gap-4">
              {products.length === 0 ? (
                <div className="premium-card p-6 text-sm leading-6 text-zinc-300">
                  Nenhum produto cadastrado ainda.
                </div>
              ) : (
                products.map((product) => (
                  <article key={product.id} className="premium-card overflow-hidden">
                    <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-28 w-full rounded-md object-cover sm:w-28"
                        loading="lazy"
                      />

                      <div className="min-w-0">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black">{product.name}</h3>
                              <span className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-zinc-300">
                                {product.active === false ? 'Inativo' : 'Ativo'}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-300">{product.description}</p>
                            <p className="mt-2 text-xs text-zinc-500">{product.id}</p>
                            <p className="mt-2 text-xs text-zinc-400">
                              Peso {product.weightKg} kg | {product.dimensionsCm?.width}x{product.dimensionsCm?.height}
                              x{product.dimensionsCm?.length} cm
                              {product.stock === null || product.stock === undefined ? '' : ` | Estoque ${product.stock}`}
                            </p>
                          </div>

                          <div className="text-left md:text-right">
                            <p className="text-xl font-black text-gold-100">
                              {formatCurrency(product.priceCents, product.currency)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button type="button" className="btn-secondary" onClick={() => editProduct(product)}>
                            <Pencil size={18} />
                            Editar
                          </button>
                          <button type="button" className="btn-secondary" onClick={() => deleteProduct(product)}>
                            <Trash2 size={18} />
                            Desativar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Pedidos</p>
              <h2 className="text-2xl font-black">{orders.length} pedidos registrados</h2>
            </div>
            <button type="button" className="btn-secondary" onClick={loadAdminData} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
              Atualizar pedidos
            </button>
          </div>

          <div className="grid gap-4">
            {orders.length === 0 ? (
              <div className="premium-card p-6 text-sm leading-6 text-zinc-300">
                Quando uma compra for iniciada no site, o pedido vai aparecer aqui.
              </div>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="premium-card p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">Pedido {order.id.slice(0, 8)}</h3>
                        <span className="rounded-md border border-gold-300/25 bg-gold-300/10 px-2 py-1 text-xs font-bold text-gold-100">
                          {paymentLabels[order.paymentStatus] || order.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">{formatDate(order.createdAt)}</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        {order.customerName || order.destination?.shippingName || 'Cliente sem nome'}
                        {order.customerEmail ? ` | ${order.customerEmail}` : ''}
                        {order.customerPhone ? ` | ${order.customerPhone}` : ''}
                      </p>
                    </div>

                    <div className="min-w-48">
                      <label className="text-sm font-bold text-zinc-300">
                        Status
                        <select
                          value={order.status}
                          onChange={(event) => updateOrder(order.id, event.target.value)}
                          disabled={savingOrderId === order.id}
                          className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/35 px-3 text-white outline-none transition focus:border-gold-300"
                        >
                          {statusOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-md border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-bold uppercase text-zinc-500">Itens</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        {order.items.map((item) => (
                          <p key={item.id}>
                            {item.quantity}x {item.name} - {formatCurrency(item.priceCents, item.currency)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-md border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-bold uppercase text-zinc-500">Entrega</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-300">{order.freight.label}</p>
                      <p className="text-sm leading-6 text-zinc-400">{order.freight.deliveryEstimate}</p>
                      <p className="text-sm leading-6 text-zinc-400">
                        {order.destination?.shippingLine1 || order.destination?.street || 'Endereço será confirmado no pagamento'}
                      </p>
                      <p className="text-sm leading-6 text-zinc-400">
                        {order.destination?.shippingCity || order.destination?.city} -{' '}
                        {order.destination?.shippingState || order.destination?.state}
                      </p>
                      <p className="text-sm leading-6 text-zinc-400">
                        CEP {order.destination?.shippingPostalCode || order.destination?.cep}
                      </p>
                    </div>

                    <div className="rounded-md border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-bold uppercase text-zinc-500">Valores</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        <p>Produtos: {formatCurrency(order.subtotalCents)}</p>
                        <p>Frete: {formatCurrency(order.freight.amountCents, order.freight.currency)}</p>
                        <p className="text-lg font-black text-gold-100">Total: {formatCurrency(order.totalCents)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
