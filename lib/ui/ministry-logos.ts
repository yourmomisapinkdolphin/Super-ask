/**
 * Institution logos, keyed by website host (without "www.").
 *
 * The files live in public/ministries/ and are each institution's own site
 * icon, fetched once. A host that is not listed has no logo on file and the
 * interface falls back to the institution's initials.
 */
export const MINISTRY_LOGOS: Record<string, string> = {
  "acu.gov.kh": "acu.gov.kh.ico",
  "banteaymeanchey.gov.kh": "banteaymeanchey.gov.kh.png",
  "business.gov.kh": "business.gov.kh.png",
  "businessregistration.moc.gov.kh": "businessregistration.moc.gov.kh.ico",
  "cadt.edu.kh": "cadt.edu.kh.png",
  "calmette.gov.kh": "calmette.gov.kh.png",
  "cambodiaip.gov.kh": "cambodiaip.gov.kh.png",
  "camdx.gov.kh": "camdx.gov.kh.png",
  "ccfdg.gov.kh": "ccfdg.gov.kh.png",
  "cdc.gov.kh": "cdc.gov.kh.png",
  "cmaa.gov.kh": "cmaa.gov.kh.png",
  "customs.gov.kh": "customs.gov.kh.png",
  "dgc.gov.kh": "dgc.gov.kh.png",
  "digitaleconomy.gov.kh": "digitaleconomy.gov.kh.png",
  "eccc.gov.kh": "eccc.gov.kh.ico",
  "edc.com.kh": "edc.com.kh.png",
  "information.gov.kh": "information.gov.kh.png",
  "irc.gov.kh": "irc.gov.kh.png",
  "itc.edu.kh": "itc.edu.kh.png",
  "kampongcham.gov.kh": "kampongcham.gov.kh.png",
  "kandal.gov.kh": "kandal.gov.kh.png",
  "maff.gov.kh": "maff.gov.kh.png",
  "mcfa.gov.kh": "mcfa.gov.kh.png",
  "mlmupc.gov.kh": "mlmupc.gov.kh.png",
  "mlvt.gov.kh": "mlvt.gov.kh.ico",
  "mme.gov.kh": "mme.gov.kh.png",
  "moc.gov.kh": "moc.gov.kh.png",
  "mod.gov.kh": "mod.gov.kh.png",
  "moe.gov.kh": "moe.gov.kh.png",
  "moh.gov.kh": "moh.gov.kh.png",
  "mop.gov.kh": "mop.gov.kh.png",
  "mosvy.gov.kh": "mosvy.gov.kh.png",
  "mowa.gov.kh": "mowa.gov.kh.png",
  "mowram.gov.kh": "mowram.gov.kh.ico",
  "mptc.gov.kh": "mptc.gov.kh.png",
  "mpwt.gov.kh": "mpwt.gov.kh.ico",
  "mrd.gov.kh": "mrd.gov.kh.png",
  "naa.gov.kh": "naa.gov.kh.png",
  "nacd.gov.kh": "nacd.gov.kh.png",
  "napv.gov.kh": "napv.gov.kh.png",
  "nbc.gov.kh": "nbc.gov.kh.png",
  "ncdd.gov.kh": "ncdd.gov.kh.png",
  "nec.gov.kh": "nec.gov.kh.png",
  "nis.gov.kh": "nis.gov.kh.png",
  "nmchc.gov.kh": "nmchc.gov.kh.png",
  "ntti.edu.kh": "ntti.edu.kh.png",
  "pressocm.gov.kh": "pressocm.gov.kh.png",
  "registrationservices.gov.kh": "registrationservices.gov.kh.png",
  "rua.edu.kh": "rua.edu.kh.png",
  "rule.edu.kh": "rule.edu.kh.png",
  "rupp.edu.kh": "rupp.edu.kh.png",
  "tax.gov.kh": "tax.gov.kh.png",
  "trc.gov.kh": "trc.gov.kh.png",
  "uhs.edu.kh": "uhs.edu.kh.png"
};

/** Path of the logo for the institution that published `url`, if one is on file. */
export function ministryLogo(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const file = MINISTRY_LOGOS[host];
    return file ? `/ministries/${file}` : null;
  } catch {
    return null;
  }
}
