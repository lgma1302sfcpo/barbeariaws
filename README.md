# Barbershop WS Landing Page

Landing page em React + Vite + Tailwind CSS para barbearia, sem login, painel ou agendamento.

## Rodar localmente

```bash
npm install
npm run dev
```

URL local padrão:

```text
http://localhost:5173/
```

## Trocar dados e imagens

Edite `src/data/siteContent.js` para alterar:

- WhatsApp: `whatsappNumber` e `whatsappMessage`
- Instagram: `instagramUrl`
- Endereço e Google Maps: `address`, `mapsUrl` e `mapsEmbedUrl`
- Logo e mídias: `logo`, `heroImage`, `video`, `galleryItems` e `comparison`
- Serviços e preços: array `services`
- Antes e depois: objeto `comparison`

Os arquivos públicos ficam em `public/assets`.
