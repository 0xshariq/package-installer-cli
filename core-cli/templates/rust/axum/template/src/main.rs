use axum::{
    routing::{get, post},
    extract::Json,
    Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

async fn index() -> &'static str {
    "Hello from Axum!"
}

async fn echo(Json(msg): Json<Message>) -> Json<Message> {
    Json(Message {
        text: format!("You said: {}", msg.text),
    })
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(index))
        .route("/echo", post(echo));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Running at http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
