use rink_core::{loader::gnu_units, parsing::datetime, ast, CURRENCY_FILE};
use std::process::exit;

fn main() {
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

  let input = std::env::args().skip(1).collect::<Vec<String>>().join(" ");
  
  match rink_core::one_line(&mut ctx, &input) {
    Ok(result) => {
      let (title, desc) = parse_result(result);
      
      // Format as JSON
      let output = serde_json::json!({
        "title": title,
        "description": desc,
      });
      println!("{}", output);
      exit(0);
    }
    Err(_) => exit(1),
  }
}

/// Extracts the title and description from `rink` result.
/// The description is anything inside brackets from `rink`, if present.
fn parse_result(result: String) -> (String, Option<String>) {
  result
    .split_once(" (")
    .map(|(title, desc)| {
      (
        title.to_string(),
        Some(desc.trim_end_matches(')').to_string()),
      )
    })
    .unwrap_or((result, None))
}