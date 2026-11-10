import { withBasePath } from "@/lib/basePath";

/** Public gallery slide recordings (resolved with basePath). */
export const PESQUISA_AGRUPADA_VIDEO_SRC = withBasePath(
  encodeURI("/Video/pesquisa agrupada.mp4"),
);

export const ORCAMENTO_VIDEO_SRC = withBasePath(
  encodeURI("/Video/orçamento.mp4"),
);
