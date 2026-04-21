# Configuracao do iOS para Tauri 2.0

## Visao Geral

Para gerar o app do Focus Board para iOS (iPhone/iPad), voce precisa de um Mac com Xcode instalado.

## Pre-requisitos

### 1. macOS
- macOS 10.15 (Catalina) ou superior
- Recomendado: macOS 12+ (Monterey)

### 2. Xcode
```bash
# Instalar via Mac App Store ou
xcode-select --install
```

### 3. Ferramentas de Linha de Comando
```bash
# Aceitar licenca do Xcode
sudo xcodebuild -license accept

# Instalar simuladores iOS
xcode-select --install
```

### 4. Dependencias do Tauri
```bash
# CocoaPods (gerenciador de dependencias iOS)
sudo gem install cocoapods

# Rust targets para iOS
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
rustup target add x86_64-apple-ios
```

## Comandos para iOS

```bash
# Ir para o diretorio do projeto
cd "/Users/miguelmartins/workspace/labs/focusboard/focusboard"

# Inicializar projeto iOS (apenas primeira vez)
npm run tauri ios init

# Executar em modo desenvolvimento (no simulador)
npm run ios:dev

# Executar em modo desenvolvimento (no dispositivo fisico)
npm run tauri ios dev -- --device

# Gerar IPA (para distribuicao interna)
npm run ios:build

# Gerar IPA de release
npm run tauri ios build -- --release
```

## IPA Gerado

Apos o build, o IPA estara em:
```
src-tauri/gen/apple/build/Focus Board.ipa
```

## Assinatura e Distribuicao

### Para testes internos (TestFlight):
1. Ter uma conta Apple Developer ($99/ano)
2. Configurar App ID no Apple Developer Portal
3. Criar certificados de assinatura
4. Criar provisioning profile

### Configurar no Xcode:
1. Abrir `src-tauri/gen/apple/Focus Board.xcodeproj`
2. Selecionar o projeto -> Signing & Capabilities
3. Selecionar seu time/empresa
4. Configurar Bundle Identifier (deve ser unico)

## Executar no Dispositivo Fisico

1. Conectar iPhone/iPad via USB
2. Confianca no computador (aparecera no dispositivo)
3. Registrar UDID no Apple Developer Portal
4. Adicionar device ao provisioning profile
5. Build com: `npm run tauri ios dev -- --device`

## Links Uteis

- Documentacao Tauri iOS: https://tauri.app/start/prerequisites/#ios
- Apple Developer: https://developer.apple.com/
- TestFlight: https://developer.apple.com/testflight/
