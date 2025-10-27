use warp::Filter;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct Message {
    text: String,
}

#[tokio::main]
async fn main() {
    let hello = warp::path::end().map(|| "Hello from Warp!");

    let echo = warp::path("echo")
        .and(warp::post())
        .and(warp::body::json())
        .map(|msg: Message| warp::reply::json(&msg));

    let routes = hello.or(echo);

    println!("Running at http://127.0.0.1:3030");
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
