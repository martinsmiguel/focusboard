# Focus Board - Tauri 2.0

Aplicativo de gerenciamento de foco e produtividade construido com React + Tauri 2.0.

## Estrutura do Projeto

```
focusboard/
├── src/                    # Codigo fonte React
├── src-tauri/             # Codigo Rust e configuracao Tauri
│   ├── src/               # Codigo Rust
│   ├── icons/             # Icones do aplicativo
│   ├── capabilities/      # Permissoes
│   ├── Cargo.toml         # Configuracao Rust
│   └── tauri.conf.json    # Configuracao Tauri
├── package.json           # Dependencias Node.js
└── vite.config.ts        # Configuracao Vite
```

## Scripts Disponiveis

### Desenvolvimento

```bash
# Executar em modo desenvolvimento (desktop)
npm run tauri:dev

# Executar apenas o frontend
npm run dev
```

### Build Desktop

```bash
# Build para desktop (gera .app no macOS, .exe no Windows)
npm run tauri:build

# Build especifico para Windows (cross-compilation)
npm run build:windows

# O build sera gerado em:
# macOS: src-tauri/target/release/bundle/macos/Focus Board.app
# macOS: src-tauri/target/release/bundle/dmg/Focus Board_0.0.0_aarch64.dmg
# Windows: src-tauri/target/release/bundle/msi/*.msi
# Windows: src-tauri/target/release/bundle/nsis/*.exe
# Linux: src-tauri/target/release/bundle/appimage/*.AppImage
# Linux: src-tauri/target/release/bundle/deb/*.deb
```

### Build Android (APK)

ATENCAO: Requisitos para Android:
- Android SDK instalado
- JAVA_HOME configurado
- ANDROID_HOME configurado

```bash
# Inicializar projeto Android (apenas primeira vez)
npm run tauri android init

# Executar em modo desenvolvimento
npm run android:dev

# Gerar APK
npm run android:build
```

### Build iOS

ATENCAO: Requisitos para iOS:
- macOS
- Xcode instalado
- Conta Apple Developer (para distribuicao)

```bash
# Inicializar projeto iOS (apenas primeira vez)
npm run tauri ios init

# Executar em modo desenvolvimento
npm run ios:dev

# Gerar IPA
npm run ios:build
```

## Builds Gerados

Apos executar `npm run tauri:build`, os arquivos serao gerados em:

**macOS:**
- App: `src-tauri/target/release/bundle/macos/Focus Board.app`
- DMG: `src-tauri/target/release/bundle/dmg/Focus Board_0.0.0_aarch64.dmg`

**Windows (quando compilado no Windows):**
- MSI: `src-tauri/target/release/bundle/msi/*.msi`
- EXE: `src-tauri/target/release/bundle/nsis/*.exe`

**Linux (quando compilado no Linux):**
- AppImage: `src-tauri/target/release/bundle/appimage/*.AppImage`
- DEB: `src-tauri/target/release/bundle/deb/*.deb`
- RPM: `src-tauri/target/release/bundle/rpm/*.rpm`

## Configuracao

### Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
# Exemplo de variavel de ambiente
MY_VARIAVEL=valor_aqui
```

### Permissoes

O aplicativo possui as seguintes permissoes configuradas:
- Leitura/escrita de arquivos
- Exportacao de dados (CSV)
- Dialogos nativos

## Notas

- O aplicativo salva dados localmente no armazenamento do Tauri
- O export CSV eh salvo na pasta Downloads do usuario
- Suporte a modo escuro/claro
- Interface responsiva para desktop e mobile

## Tecnologias

- **Frontend:** React 19 + TypeScript + Tailwind CSS + Motion
- **Desktop/Mobile:** Tauri 2.0 (Rust)
- **Build:** Vite 6
- **Icones:** Lucide React
