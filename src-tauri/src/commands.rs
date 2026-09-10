use crate::security;
use tauri::Manager;
use std::fs;

#[tauri::command]
pub async fn get_hardware_id() -> Result<String, String> {
    security::generate_hardware_fingerprint().await
}

#[tauri::command]
pub async fn check_license(token: String) -> Result<bool, String> {
    let hw_id = security::generate_hardware_fingerprint().await?;
    match security::verify_license(&token, &hw_id) {
        Ok(_) => Ok(true),
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub fn export_backup(app: tauri::AppHandle, dest_path: String) -> Result<bool, String> {
    let config_dir = app.path().app_config_dir().unwrap().join("attendo_core.db");
    let data_dir = app.path().app_data_dir().unwrap().join("attendo_core.db");
    let db_path = if config_dir.exists() { config_dir } else { data_dir };
    
    fs::copy(&db_path, dest_path).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub fn trigger_shadow_backup(app: tauri::AppHandle) -> Result<bool, String> {
    let config_dir = app.path().app_config_dir().unwrap().join("attendo_core.db");
    let data_dir = app.path().app_data_dir().unwrap().join("attendo_core.db");
    let db_path = if config_dir.exists() { config_dir } else { data_dir };
    
    let shadow_dir = app.path().app_data_dir().unwrap().join("Shadow_Copies");
    if !shadow_dir.exists() {
        fs::create_dir_all(&shadow_dir).map_err(|e| e.to_string())?;
    }
    
    let recent = shadow_dir.join("Attendo_Backup_Recent.attdb");
    let older = shadow_dir.join("Attendo_Backup_Older.attdb");
    let oldest = shadow_dir.join("Attendo_Backup_Oldest.attdb");
    
    if oldest.exists() { fs::remove_file(&oldest).unwrap_or(()); }
    if older.exists() { fs::rename(&older, &oldest).unwrap_or(()); }
    if recent.exists() { fs::rename(&recent, &older).unwrap_or(()); }
    
    fs::copy(&db_path, &recent).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub fn create_temp_backup(app: tauri::AppHandle, src_path: String) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    }
    let temp_name = format!("merge_temp_{}.db", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
    let temp_path = data_dir.join(temp_name);
    
    fs::copy(src_path, &temp_path).map_err(|e| e.to_string())?;
    Ok(temp_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_temp_backup(path: String) -> Result<bool, String> {
    fs::remove_file(path).unwrap_or(());
    Ok(true)
}

#[tauri::command]
pub fn auto_shadow_export(app: tauri::AppHandle, session_name: String, pdf_bytes: Vec<u8>, excel_bytes: Vec<u8>, filename_override: Option<String>) -> Result<bool, String> {
    let exports_dir = app.path().app_data_dir().unwrap().join("Exports");
    
    let mut workspace = "Unknown".to_string();
    if let Some(start) = session_name.find("[Grade ") {
        if let Some(end) = session_name[start..].find("]") {
            workspace = session_name[start+7..start+end].to_string();
        }
    }
    
    let parts: Vec<&str> = session_name.split(" - ").collect();
    let mut s_type = "Session".to_string();
    if parts.len() > 3 {
        s_type = parts[3].trim().to_string();
    }
    
    let shadow_dir = exports_dir.join(format!("Grade {}", workspace)).join(s_type);
    
    if !shadow_dir.exists() {
        fs::create_dir_all(&shadow_dir).map_err(|e| e.to_string())?;
    }
    
    let base_name = session_name.replace(&['\\', '/', ':', '*', '?', '"', '<', '>', '|'][..], "");
    let safe_name = filename_override.unwrap_or(base_name);
    
    if !pdf_bytes.is_empty() {
        fs::write(shadow_dir.join(format!("{}.pdf", safe_name)), pdf_bytes).map_err(|e| e.to_string())?;
    }
    if !excel_bytes.is_empty() {
        fs::write(shadow_dir.join(format!("{}.xlsx", safe_name)), excel_bytes).map_err(|e| e.to_string())?;
    }
    
    Ok(true)
}
