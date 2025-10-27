#[macro_use] extern crate rocket;
use rocket::serde::{json::Json, Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

#[get("/")]
fn index() -> &'static str {
    "Hello from Rocket!"
}

#[post("/echo", format = "json", data = "<msg>")]
fn echo(msg: Json<Message>) -> Json<Message> {
    Json(Message {
        text: format!("You said: {}", msg.text),
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, echo])
}
