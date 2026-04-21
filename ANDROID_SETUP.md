# Configuracao do Android para Tauri 2.0

## Visao Geral

Para gerar o APK do Focus Board para Android, voce precisa configurar o Android SDK.

## Pre-requisitos

### 1. Instalar Android Studio
```bash
# Usando Homebrew
brew install --cask android-studio
```

Ou baixe de: https://developer.android.com/studio

### 2. Configurar Android SDK

Apos instalar o Android Studio:

1. Abra o Android Studio
2. Va em `Preferences > Appearance & Behavior > System Settings > Android SDK`
3. Anote o caminho do Android SDK (geralmente `~/Library/Android/sdk`)
4. Instale as seguintes ferramentas:
   - SDK Platforms (Android 13 ou superior)
   - SDK Build-Tools
   - NDK (Native Development Kit)
   - Android SDK Command Line Tools

### 3. Configurar Variaveis de Ambiente

Adicione ao seu `~/.zshrc` ou `~/.bash_profile`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Depois recarregue:
```bash
source ~/.zshrc
```

### 4. Instalar Java (JDK)

```bash
# Usando Homebrew
brew install openjdk@17

# Configurar JAVA_HOME
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH
```

## Comandos para Android

Apos configurar o ambiente:

```bash
# Ir para o diretorio do projeto
cd "/Users/miguelmartins/workspace/labs/focusboard"

# Inicializar projeto Android (apenas primeira vez)
npm run tauri android init

# Executar em modo desenvolvimento (com emulador conectado)
npm run tauri android dev

# Gerar APK de debug
npm run tauri android build -- --apk

# Gerar APK de release
npm run tauri android build -- --apk --release
```

## APK Gerado

Apos o build, o APK estara em:
```
src-tauri/gen/android/app/build/outputs/apk/
```

- Debug: `app-debug.apk`
- Release: `app-release-unsigned.apk` (requer assinatura)

## Assinar APK (Release)

Para publicar na Play Store, voce precisa assinar o APK:

```bash
# Gerar keystore (apenas primeira vez)
keytool -genkey -v -keystore focusboard.keystore -alias focusboard -keyalg RSA -keysize 2048 -validity 10000

# Assinar APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore focusboard.keystore app-release-unsigned.apk focusboard

# Verificar assinatura
jarsigner -verify -verbose -certs app-release-unsigned.apk
```

## Links Uteis

- Documentacao Tauri Android: https://tauri.app/start/prerequisites/#android
- Configuracao de variaveis: https://developer.android.com/studio/command-line/variables
