include!("graphql/schema.rs");

fn export_sdl() {
  let cwd = std::env::current_dir().unwrap();
  let out_file = cwd.parent().unwrap().join("schema.gql");
  let file_contents = format!(
    "\
# This file is auto-generated.
# To modify schema definitions, make any edits you need
# to your Rust code, and re-build the application.

{}",
    SCHEMA.sdl()
  );
  std::fs::write(out_file, file_contents).unwrap();
}

fn main() {
  export_sdl();
  tauri_build::build()
}
