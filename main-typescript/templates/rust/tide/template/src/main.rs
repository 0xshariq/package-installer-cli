use tide::{Request, Response, StatusCode};

#[async_std::main]
async fn main() -> tide::Result<()> {
    let mut app = tide::new();
    app.at("/").get(|_| async { Ok("Hello from Tide!") });
    app.at("/echo").post(echo);
    app.listen("127.0.0.1:8080").await?;
    Ok(())
}

async fn echo(mut req: Request<()>) -> tide::Result {
    let body: serde_json::Value = req.body_json().await?;
    Ok(Response::builder(StatusCode::Ok)
        .body(serde_json::to_string(&body)?)
        .build())
}
