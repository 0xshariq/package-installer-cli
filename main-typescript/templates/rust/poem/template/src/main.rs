use poem::{get, handler, post, web::Json, Route, Server};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

#[handler]
fn index() -> &'static str {
    "Hello from Poem!"
}

#[handler]
fn echo(Json(msg): Json<Message>) -> Json<Message> {
    Json(Message {
        text: format!("You said: {}", msg.text),
    })
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let app = Route::new().at("/", get(index)).at("/echo", post(echo));
    println!("Running at http://127.0.0.1:4000");
    Server::new("127.0.0.1:4000").run(app).await
}
