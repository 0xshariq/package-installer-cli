use salvo::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

#[handler]
async fn index() -> &'static str {
    "Hello from Salvo!"
}

#[handler]
async fn echo(JsonBody(msg): JsonBody<Message>) -> Json<Message> {
    Json(msg)
}

#[tokio::main]
async fn main() {
    let router = Router::new().get(index).push(Router::with_path("echo").post(echo));
    println!("Running at http://127.0.0.1:7878");
    Server::new(TcpListener::bind("127.0.0.1:7878"))
        .serve(router)
        .await;
}
