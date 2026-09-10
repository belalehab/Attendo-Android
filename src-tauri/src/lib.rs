#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub mod security;
pub mod commands;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::get_hardware_id,
            commands::check_license,
            commands::export_backup,
            commands::trigger_shadow_backup,
            commands::create_temp_backup,
            commands::delete_temp_backup,
            commands::auto_shadow_export
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
