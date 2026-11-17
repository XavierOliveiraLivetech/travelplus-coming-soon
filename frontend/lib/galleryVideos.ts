import { withBasePath } from "@/lib/basePath";

/**
 * Gallery sneak recordings — must be progressive MP4 (moov before mdat),
 * not OBS "fragmented MP4" (moof/mvex). Use `npm run remux:sneaks` after export.
 */
export const PESQUISA_AGRUPADA_VIDEO_SRC = withBasePath(
  encodeURI("/sneaks/pesquisa agrupada.mp4?v=7"),
);

export const ORCAMENTO_VIDEO_SRC = withBasePath("/sneaks/orcamento.mp4?v=7");
