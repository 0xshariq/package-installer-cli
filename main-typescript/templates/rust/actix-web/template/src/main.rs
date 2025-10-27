use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello from Actix Web!")
}

#[post("/echo")]
async fn echo(msg: web::Json<Message>) -> impl Responder {
    HttpResponse::Ok().json(&msg.0)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(index).service(echo))
        .bind("127.0.0.1:8080")?
        .run()
        .await
}
