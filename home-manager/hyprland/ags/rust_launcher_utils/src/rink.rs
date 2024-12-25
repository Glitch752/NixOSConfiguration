use rink_core::{ast, loader::gnu_units, parsing::datetime, Context, CURRENCY_FILE};

pub fn create_context() -> Context {
  let mut ctx = rink_core::Context::new();
  let units = gnu_units::parse_str(rink_core::DEFAULT_FILE.unwrap());
  let dates = datetime::parse_datefile(rink_core::DATES_FILE.unwrap());

  let mut currency_defs = Vec::new();

  match reqwest::blocking::get("https://rinkcalc.app/data/currency.json") {
    Ok(response) => match response.json::<ast::Defs>() {
      Ok(mut live_defs) => {
        currency_defs.append(&mut live_defs.defs);
      }
      Err(why) => println!("Error parsing currency json: {}", why),
    },
    Err(why) => println!("Error fetching up-to-date currency conversions: {}", why),
  }

  currency_defs.append(&mut gnu_units::parse_str(CURRENCY_FILE.unwrap()).defs);

  let _ = ctx.load(units);
  let _ = ctx.load(ast::Defs {
    defs: currency_defs,
  });
  ctx.load_dates(dates);

  ctx
}

pub fn execute(ctx: &mut Context, input: &str) {  
  match rink_core::one_line(ctx, input) {
    Ok(result) => {
      let output = serde_json::json!({
        "error": false,
        "output": result,
      });
      println!("{}", output);
    }
    Err(result) => {
      let output = serde_json::json!({
        "error": true,
        "output": result,
      });
      println!("{}", output);
    }
  }
}