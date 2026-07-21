// Le référentiel (Trade, Skill, Country) porte nameFr/nameEn depuis le
// départ ; ce helper centralise le choix du bon champ selon la langue de
// l'interface, pour ne pas dupliquer `locale === "en" ? x.nameEn : x.nameFr`
// à chaque site d'affichage.
export function localizedName(entity: { nameFr: string; nameEn: string }, locale: string): string {
  return locale === "en" ? entity.nameEn : entity.nameFr;
}
