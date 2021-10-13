#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};

#[tauri::command]
fn handle_graphql(friend: String) -> String {
  format!("Hello, {}!", friend)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![handle_graphql])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[test]
fn it_works() {
  let x = 3;
  let y = 3;
  assert_eq!(x, y);
}
