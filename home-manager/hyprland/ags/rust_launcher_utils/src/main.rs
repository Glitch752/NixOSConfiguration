use std::process::exit;

mod rink;
mod symbols;

// TODO: Switch to a socket-based IPC system to reduce latency?

struct State {
  rink_ctx: rink_core::Context,
  symbols: symbols::Symbols
}

fn main() {
  let stdin = std::io::stdin();

  let mut state = State {
    rink_ctx: rink::create_context(),
    symbols: symbols::load_symbols()
  };

  // Listen for stdin input, and run commands on newlines
  loop {
    let mut input = String::new();
    stdin.read_line(&mut input).unwrap();
    let input = input.trim().split(" ").collect::<Vec<&str>>();
    if input.len() == 0 {
      continue;
    }

    let command = input[0];
    match command {
      "rink" => rink::execute(&mut state.rink_ctx, &input[1..].join(" ")),
      "symbols" => symbols::execute(&mut state.symbols, &input[1..].join(" ")),
      "exit" => exit(0),
      _ => {
        println!("Invalid command");
      }
    }
  }
}