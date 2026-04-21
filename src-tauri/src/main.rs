// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Configurações adicionais na inicialização
            let window = app.get_webview_window("main").unwrap();
            
            // Define o tamanho mínimo da janela
            window.set_min_size(Some(tauri::Size::Logical(tauri::LogicalSize {
                width: 800.0,
                height: 600.0,
            }))).ok();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
