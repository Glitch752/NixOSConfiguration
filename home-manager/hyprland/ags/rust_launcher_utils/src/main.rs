use rink_core::{loader::gnu_units, parsing::datetime, ast, CURRENCY_FILE};
use std::process::exit;

fn main() {
  let subcommand = std::env::args().nth(1).unwrap();

  match subcommand.as_str() {
    "rink" => rink(),
    _ => panic!("Unknown subcommand: {}", subcommand),
  }
}

fn rink() {
  let mut ctx = rink_core::Context::new();

  let units = gnu_units::parse_str(rink_core::DEFAULT_FILE.unwrap());
  let dates = datetime::parse_datefile(rink_core::DATES_FILE.unwrap());

  let mut currency_defs = Vec::new();

  // TODO: Get reqwest building; openssl dependency issues cause weird errors
  // match reqwest::blocking::get("https://rinkcalc.app/data/currency.json") {
  //   Ok(response) => match response.json::<ast::Defs>() {
  //     Ok(mut live_defs) => {
  //       currency_defs.append(&mut live_defs.defs);
  //     }
  //     Err(why) => println!("Error parsing currency json: {}", why),
  //   },
  //   Err(why) => println!("Error fetching up-to-date currency conversions: {}", why),
  // }

  currency_defs.append(&mut gnu_units::parse_str(CURRENCY_FILE.unwrap()).defs);

  let _ = ctx.load(units);
  ctx.load(ast::Defs {
    defs: currency_defs,
  });
  ctx.load_dates(dates);

  let input = std::env::args().skip(2).collect::<Vec<String>>().join(" ");
  
  match rink_core::one_line(&mut ctx, &input) {
    Ok(result) => {
      let output = serde_json::json!({
        "error": false,
        "output": result,
      });
      println!("{}", output);
      exit(0);
    }
    Err(result) => {
      let output = serde_json::json!({
        "error": true,
        "output": result,
      });
      println!("{}", output);
      exit(1);
    }
  }
}