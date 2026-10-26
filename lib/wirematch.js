/** Which cached wire stories belong on a given section page. */

// The wire only has 'kenya' and 'world' regions, so every other section picks
// its stories out of both pools by keyword. Word boundaries only — otherwise
// "investigate" counts as "invest".
const PATTERNS = {
  business:
    /\b(markets?|econom(?:y|ic|ies)|business|banks?|banking|inflation|tariffs?|trades?|oil|stocks?|shares?|investors?|investing|investments?|gdp|currencies|currency|budgets?|earnings|profits?|startups?|shillings?|nasdaq)\b/i,
  africa:
    /\b(africa(?:n)?|nigeria(?:n)?|ghana|egypt(?:ian)?|ethiopia|kenya(?:n)?|tanzania|uganda|rwanda|sudan|somalia|congo|zimbabwe|mozambique|zambia|malawi|senegal|mali|niger(?!ia)|cameroon|angola|botswana|madagascar)\b/i,
  tech: /\b(tech(?:nology)?|software|internet|cyber|\bai\b|artificial intelligence|gadget|startup|data centers?|digital|smartphone|robot|coding|\bapps?\b|cloud computing|google|apple|microsoft|openai|chatgpt|silicon chip|semiconductor|automation|algorithm)/i,
  entertainment:
    /\b(entertainment|music|film|movies?|celebrit(?:y|ies)|\btv\b|television|hollywood|bollywood|streaming|album|concert|box office|grammy|oscar|emmy|reality show|sitcom|award|singer|actor|actress|rapper|band|tour|premiere)/i,
}

/** Filter wire items (from loadWire) for a homepage/section category. */
export function wireFor(category, items) {
  if (category === 'kenya' || category === 'world') {
    return items.filter((i) => i.region === category)
  }
  const re = PATTERNS[category]
  if (!re) return []
  return items.filter((i) => re.test(`${i.title} ${i.excerpt || ''}`))
}
