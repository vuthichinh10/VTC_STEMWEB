# ADR 0001: React Native Web with Expo Router

Status: accepted. The classroom web experience is first priority, while screens, state and domain contracts remain portable to Android/iOS. Platform-only editors and transports will use `.web.tsx` / `.native.tsx` adapters and must not leak browser globals into shared modules.
