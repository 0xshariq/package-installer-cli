use gotham::hyper::{Body, Response, StatusCode};
use gotham::plain::PlainTextResponse;
use gotham::state::State;
use gotham::router::builder::*;
use gotham::router::Router;

fn hello(state: State) -> (State, PlainTextResponse<&'static str>) {
    (state, PlainTextResponse::new("Hello from Gotham!"))
}

fn router() -> Router {
    build_simple_router(|route| {
        route.get("/").to(hello);
    })
}

fn main() {
    println!("Running at http://127.0.0.1:7878");
    gotham::start("127.0.0.1:7878", router());
}
