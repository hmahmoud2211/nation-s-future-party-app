/**
 * Every bundled image, one `require()` each, so screens and components import names, not paths.
 *
 * The official artwork is not in the repository yet, so these are `null` and the UI falls back to
 * the placeholder emblem / navy gradient. When the files are supplied, add them under
 * `src/assets/images/` and set, e.g.:
 *
 *   brandLogo: require('../assets/images/logo.png'),     // transparent background, ≥ 512px
 *   headerBackground: require('../assets/images/header.jpg'),
 */
export const images: { brandLogo: number | null; headerBackground: number | null } = {
  /** Official logo (circular emblem). */
  brandLogo: null,
  /** Landmark photo behind the home header, under a navy overlay. */
  headerBackground: null,
};
