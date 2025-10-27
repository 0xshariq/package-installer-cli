use thruster::{context::basic_context::*, m, middleware_fn, App, Request};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

#[middleware_fn]
async fn hello(mut context: BasicContext, _next: MiddlewareNext<BasicContext>) -> BasicContext {
    context.body = "Hello from Thruster!".to_string();
    context
}

#[middleware_fn]
async fn echo(mut context: BasicContext, _next: MiddlewareNext<BasicContext>) -> BasicContext {
    let body = context.body_string().await.unwrap_or_default();
    context.body = body;
    context
}

#[tokio::main]
async fn main() {
    let app = App::<Request, BasicContext, ()>::new_basic()
        .get("/", m!(hello))
        .post("/echo", m!(echo));

    println!("Running at http://127.0.0.1:4321");
    thruster::server::Server::new(app).start("127.0.0.1", 4321, 1).await;
}
