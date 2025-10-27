use rouille::Request;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Message {
    text: String,
}

fn main() {
    println!("Running at http://127.0.0.1:8000");
    rouille::start_server("127.0.0.1:8000", move |request| {
        rouille::log(&request, std::io::stdout());
        router!(request,
            (GET) (/) => {
                rouille::Response::text("Hello from Rouille!")
            },
            (POST) (/echo) => {
                let data: Message = rouille::input::json_input(request).unwrap();
                rouille::Response::json(&data)
            },
            _ => rouille::Response::empty_404()
        )
    });
}
