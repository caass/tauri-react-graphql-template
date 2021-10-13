mod schema;

use async_graphql::{Request as GraphQlQuery, Response as GraphQlResponse};
use schema::SCHEMA;

#[tauri::command]
pub async fn handle_graphql(query: GraphQlQuery) -> GraphQlResponse {
  SCHEMA.execute(query).await
}
