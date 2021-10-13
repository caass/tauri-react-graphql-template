use async_graphql::*;
use once_cell::sync::Lazy;

pub struct Query;

#[Object]
impl Query {
  async fn hello(&self) -> String {
    "Hello, world!".to_string()
  }
}

pub static SCHEMA: Lazy<Schema<Query, EmptyMutation, EmptySubscription>> =
  Lazy::new(|| Schema::new(Query, EmptyMutation, EmptySubscription));
