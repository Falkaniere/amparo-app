# 🌿 Amparo — App Mobile

App mobile do Amparo. React Native + Expo.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | React Native + Expo SDK 51 |
| Navegação | Expo Router (file-based) |
| Estado | Zustand |
| Backend | Supabase JS SDK |
| Mapas | React Native Maps |
| Push | Expo Notifications |
| Build | EAS Build |

## Setup

```bash
npx create-expo-app amparo-app --template blank-typescript
cd amparo-app
npm install @supabase/supabase-js zustand expo-router
npx expo start
```

## Fluxos

- **Família**: Splash → Home → Solicitação → Lista → Perfil → Pagamento → Tracking → Avaliação
- **Acompanhante**: Cadastro → Home → Detalhe → Disponibilidade → Check-in → Ganhos → Perfil
