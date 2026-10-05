import imageDimensions from '../../data/imageDimensions.json'

// Preserva imagens dinâmicas da loja; informa dimensões reais quando conhecidas.
export default function SiteImage({ src, ...props }) {
  return <img src={src} decoding="async" {...imageDimensions[src]} {...props} />
}
