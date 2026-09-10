use sha2::{Sha256, Digest};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LicenseClaims {
    pub hwId: String,
    pub exp: usize,
}

pub async fn generate_hardware_fingerprint() -> Result<String, String> {
    // For Android, we use a fixed device ID for now, or we could generate an Installation ID.
    // In a real app, this should call JNI to get Settings.Secure.ANDROID_ID
    // Here we just use a placeholder that matches the Android build
    Ok("ANDROID_MOBILE_DEVICE_001".to_string())
}

pub fn verify_license(token: &str, expected_hw_id: &str) -> Result<LicenseClaims, String> {
    let key = b"Attendo_Secure_RSA_2026_!@#_Key";
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;
    
    let token_data = decode::<LicenseClaims>(
        token,
        &DecodingKey::from_secret(key),
        &validation,
    ).map_err(|e| e.to_string())?;

    if token_data.claims.hwId != expected_hw_id {
        return Err("License hardware mismatch".into());
    }

    Ok(token_data.claims)
}
